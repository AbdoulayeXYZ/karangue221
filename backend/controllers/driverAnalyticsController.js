const db = require('../config/db');
const Driver = require('../models/driverModel');
const Violation = require('../models/violationModel');
const Telemetry = require('../models/telemetryModel');

/**
 * Récupère les analyses complètes d'un conducteur
 * @param {*} req - Requête Express
 * @param {*} res - Réponse Express
 */
exports.getDriverAnalytics = async (req, res) => {
  try {
    const driverId = req.params.id;
    
    // Récupérer les données du conducteur
    const [driverRows] = await db.query('SELECT * FROM drivers WHERE id = ?', [driverId]);
    const driver = driverRows[0];
    
    if (!driver) {
      return res.status(404).json({ error: 'Conducteur non trouvé' });
    }
    
    // Récupérer les violations du conducteur
    const [violationsRows] = await db.query(
      'SELECT * FROM violations WHERE driver_id = ? ORDER BY date DESC', 
      [driverId]
    );
    
    // Calculer les analyses
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // Violations du mois en cours
    const thisMonthViolations = violationsRows.filter(
      v => new Date(v.date) >= startOfMonth
    );
    
    // Violations du mois précédent
    const lastMonthViolations = violationsRows.filter(
      v => new Date(v.date) >= lastMonth && new Date(v.date) < startOfMonth
    );
    
    // Calculer les jours sécurisés
    const violationDates = violationsRows.map(v => new Date(v.date).toDateString());
    let safeDays = 0;
    for (let d = new Date(now); d >= startOfMonth; d.setDate(d.getDate() - 1)) {
      if (!violationDates.includes(d.toDateString())) {
        safeDays++;
      } else {
        break;
      }
    }
    
    // Générer les données timeline pour le graphique (30 derniers jours)
    const timelineData = [];
    for (let i = 0; i < 30; i++) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      const dayViolations = violationsRows.filter(
        v => new Date(v.date).toDateString() === day.toDateString()
      );
      const score = Math.max(0, 100 - 5 * dayViolations.length);
      timelineData.unshift({
        date: day.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        score,
        violations: dayViolations.length
      });
    }
    
    // Calculer le score global (moyenne sur 30 jours)
    const overallScore = Math.round(
      timelineData.reduce((sum, d) => sum + d.score, 0) / timelineData.length
    );
    
    // Obtenir la répartition des types de violations
    const behaviorTypes = [
      { key: 'safe', label: 'Conduite Sécurisée', color: '#10B981' },
      { key: 'speeding', label: 'Excès de Vitesse', color: '#EF4444' },
      { key: 'harsh_braking', label: 'Freinage Brusque', color: '#F59E0B' },
      { key: 'harsh_acceleration', label: 'Accélération Brusque', color: '#F97316' },
      { key: 'sharp_turn', label: 'Virages Serrés', color: '#8B5CF6' },
      { key: 'fatigue', label: 'Fatigue Détectée', color: '#EC4899' }
    ];
    
    const totalEvents = violationsRows.length + 1; // +1 pour éviter division par zéro
    const scoringData = behaviorTypes.map(type => {
      const count = violationsRows.filter(v => v.type === type.label).length;
      return {
        name: type.label,
        value: Math.round((count / totalEvents) * 100),
        color: type.color
      };
    });
    
    // Ajouter le pourcentage de conduite sécurisée
    scoringData[0].value = 100 - scoringData.slice(1).reduce((sum, v) => sum + v.value, 0);
    
    // Construire l'objet de réponse
    const response = {
      driver: {
        ...driver,
        overallScore,
        violations: thisMonthViolations.length,
        safeDays
      },
      analytics: {
        timelineData,
        scoringData,
        overallScore
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la récupération des analyses du conducteur:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
};

/**
 * Génère un rapport PDF pour un conducteur
 * @param {*} req - Requête Express
 * @param {*} res - Réponse Express
 */
exports.exportPDFReport = async (req, res) => {
  try {
    const driverId = req.params.id;
    const { start_date, end_date } = req.query;
    const PDFDocument = require('pdfkit');
    const moment = require('moment');
    moment.locale('fr');
    
    // Récupérer les données nécessaires pour le rapport
    const [driverRows] = await db.query('SELECT * FROM drivers WHERE id = ?', [driverId]);
    const driver = driverRows[0];
    
    if (!driver) {
      return res.status(404).json({ error: 'Conducteur non trouvé' });
    }
    
    // Récupérer les violations
    let violationsQuery = 'SELECT * FROM violations WHERE driver_id = ?';
    const params = [driverId];
    
    if (start_date && end_date) {
      violationsQuery += ' AND date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    } else if (start_date) {
      violationsQuery += ' AND date >= ?';
      params.push(start_date);
    } else if (end_date) {
      violationsQuery += ' AND date <= ?';
      params.push(end_date);
    }
    
    violationsQuery += ' ORDER BY date DESC';
    const [violationsRows] = await db.query(violationsQuery, params);
    
    // Création du document PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // En-têtes pour le téléchargement
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=rapport_conducteur_${driverId}_${moment().format('YYYY-MM-DD')}.pdf`);
    
    // Pipe le document PDF vers la réponse
    doc.pipe(res);
    
    // Logo et en-tête
    doc.fontSize(25).text('Karangue 221', { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).text('Rapport de Comportement Conducteur', { align: 'center' });
    doc.moveDown();
    
    // Informations du conducteur
    doc.fontSize(14).text(`Conducteur: ${driver.first_name} ${driver.last_name}`, { align: 'left' });
    doc.fontSize(12).text(`ID: ${driver.id}`, { align: 'left' });
    doc.fontSize(12).text(`Licence: ${driver.license_number || 'Non renseignée'}`, { align: 'left' });
    doc.fontSize(12).text(`Véhicule: ${driver.vehicle || 'Non renseigné'}`, { align: 'left' });
    doc.moveDown();
    
    // Période du rapport
    let periodeText = 'Période: ';
    if (start_date && end_date) {
      periodeText += `Du ${moment(start_date).format('DD/MM/YYYY')} au ${moment(end_date).format('DD/MM/YYYY')}`;
    } else if (start_date) {
      periodeText += `Depuis le ${moment(start_date).format('DD/MM/YYYY')}`;
    } else if (end_date) {
      periodeText += `Jusqu'au ${moment(end_date).format('DD/MM/YYYY')}`;
    } else {
      periodeText += 'Toutes les données disponibles';
    }
    doc.fontSize(12).text(periodeText, { align: 'left' });
    doc.moveDown();
    
    // Statistiques générales
    doc.fontSize(16).text('Statistiques Générales', { align: 'left' });
    doc.moveDown(0.5);
    
    // Calcul du score moyen
    let scoreTotal = 0;
    violationsRows.forEach(v => {
      const day = new Date(v.date);
      const dayViolations = violationsRows.filter(
        viol => new Date(viol.date).toDateString() === day.toDateString()
      ).length;
      scoreTotal += Math.max(0, 100 - 5 * dayViolations);
    });
    
    const scoreGlobal = violationsRows.length > 0 
      ? Math.round(scoreTotal / violationsRows.length) 
      : 100;
    
    // Nombre de violations critiques
    const violationsCritiques = violationsRows.filter(
      v => (v.severity || v.gravite || '').toLowerCase() === 'critique'
    ).length;
    
    // Coût total
    const coutTotal = violationsRows.reduce((sum, v) => sum + (v.cost || 0), 0);
    
    doc.fontSize(12).text(`Score Global: ${scoreGlobal}/100`, { align: 'left' });
    doc.fontSize(12).text(`Nombre Total de Violations: ${violationsRows.length}`, { align: 'left' });
    doc.fontSize(12).text(`Violations Critiques: ${violationsCritiques}`, { align: 'left' });
    doc.fontSize(12).text(`Coût Total: ${coutTotal.toLocaleString('fr-FR')} XOF`, { align: 'left' });
    doc.moveDown();
    
    // Tableau des violations
    if (violationsRows.length > 0) {
      doc.fontSize(16).text('Détail des Violations', { align: 'left' });
      doc.moveDown(0.5);
      
      // En-têtes du tableau
      const tableTop = doc.y;
      const tableLeft = 50;
      doc.fontSize(10).text('Date', tableLeft, tableTop);
      doc.text('Type', tableLeft + 90, tableTop);
      doc.text('Gravité', tableLeft + 200, tableTop);
      doc.text('Coût', tableLeft + 280, tableTop);
      doc.text('Lieu', tableLeft + 350, tableTop);
      
      // Ligne de séparation
      doc.moveTo(tableLeft, tableTop + 15)
         .lineTo(tableLeft + 500, tableTop + 15)
         .stroke();
      
      // Données du tableau
      let tableRow = tableTop + 25;
      
      // Afficher max 20 violations pour ne pas surcharger le PDF
      const maxViolations = Math.min(violationsRows.length, 20);
      for (let i = 0; i < maxViolations; i++) {
        const v = violationsRows[i];
        doc.fontSize(8).text(moment(v.date).format('DD/MM/YYYY'), tableLeft, tableRow);
        doc.text(v.type || 'N/A', tableLeft + 90, tableRow);
        doc.text(v.severity || 'N/A', tableLeft + 200, tableRow);
        doc.text(`${(v.cost || 0).toLocaleString('fr-FR')} XOF`, tableLeft + 280, tableRow);
        doc.text(v.location || 'N/A', tableLeft + 350, tableRow);
        tableRow += 20;
        
        // Aller à une nouvelle page si nécessaire
        if (tableRow > doc.page.height - 50) {
          doc.addPage();
          tableRow = 50;
        }
      }
      
      // Indiquer s'il y a plus de violations que celles affichées
      if (violationsRows.length > 20) {
        doc.moveDown();
        doc.fontSize(10).text(`... et ${violationsRows.length - 20} violations supplémentaires.`, { align: 'center', italic: true });
      }
    } else {
      doc.fontSize(12).text('Aucune violation enregistrée pour la période sélectionnée.', { align: 'center', italic: true });
    }
    
    // Pied de page
    doc.moveDown(2);
    doc.fontSize(10).text(`Rapport généré le ${moment().format('DD/MM/YYYY à HH:mm')}`, { align: 'center' });
    doc.fontSize(10).text('Karangue 221 - Système de Suivi des Conducteurs', { align: 'center' });
    
    // Finaliser le document
    doc.end();
  } catch (error) {
    console.error('Erreur lors de la génération du rapport PDF:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
};

/**
 * Exporte les données d'un conducteur au format CSV
 * @param {*} req - Requête Express
 * @param {*} res - Réponse Express
 */
exports.exportCSVData = async (req, res) => {
  try {
    const driverId = req.params.id;
    const { start_date, end_date } = req.query;
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    const moment = require('moment');
    moment.locale('fr');
    
    // Récupérer les données du conducteur
    const [driverRows] = await db.query('SELECT * FROM drivers WHERE id = ?', [driverId]);
    const driver = driverRows[0];
    
    if (!driver) {
      return res.status(404).json({ error: 'Conducteur non trouvé' });
    }
    
    // Récupérer les violations
    let violationsQuery = 'SELECT * FROM violations WHERE driver_id = ?';
    const params = [driverId];
    
    if (start_date && end_date) {
      violationsQuery += ' AND date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    } else if (start_date) {
      violationsQuery += ' AND date >= ?';
      params.push(start_date);
    } else if (end_date) {
      violationsQuery += ' AND date <= ?';
      params.push(end_date);
    }
    
    violationsQuery += ' ORDER BY date DESC';
    const [violationsRows] = await db.query(violationsQuery, params);
    
    // Créer un nom de fichier temporaire
    const fileName = `violations_conducteur_${driverId}_${moment().format('YYYYMMDD_HHmmss')}.csv`;
    const filePath = `./temp/${fileName}`;
    
    // Assurer que le dossier temp existe
    const fs = require('fs');
    if (!fs.existsSync('./temp')) {
      fs.mkdirSync('./temp');
    }
    
    // Configurer le writer CSV
    const csvWriter = createCsvWriter({
      path: filePath,
      header: [
        { id: 'date', title: 'Date' },
        { id: 'type', title: 'Type de Violation' },
        { id: 'severity', title: 'Gravité' },
        { id: 'cost', title: 'Coût (XOF)' },
        { id: 'location', title: 'Lieu' },
        { id: 'description', title: 'Description' }
      ],
      fieldDelimiter: ';'
    });
    
    // Formater les données pour le CSV
    const csvData = violationsRows.map(v => ({
      date: moment(v.date).format('DD/MM/YYYY'),
      type: v.type || 'N/A',
      severity: v.severity || 'N/A',
      cost: v.cost || 0,
      location: v.location || 'N/A',
      description: v.description || 'N/A'
    }));
    
    // Écrire le fichier CSV
    await csvWriter.writeRecords(csvData);
    
    // Envoyer le fichier en réponse
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    
    // Lire et envoyer le fichier
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    // Supprimer le fichier après envoi
    fileStream.on('end', () => {
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error('Erreur lors de l\'export CSV:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
};

/**
 * Envoie un rapport par email
 * @param {*} req - Requête Express
 * @param {*} res - Réponse Express
 */
exports.emailReport = async (req, res) => {
  try {
    const driverId = req.params.id;
    const { email, start_date, end_date, report_type } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Adresse email requise' });
    }
    
    // Valider le format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Format d\'email invalide' });
    }
    
    const nodemailer = require('nodemailer');
    const moment = require('moment');
    moment.locale('fr');
    
    // Récupérer les données du conducteur
    const [driverRows] = await db.query('SELECT * FROM drivers WHERE id = ?', [driverId]);
    const driver = driverRows[0];
    
    if (!driver) {
      return res.status(404).json({ error: 'Conducteur non trouvé' });
    }
    
    // Récupérer les violations
    let violationsQuery = 'SELECT * FROM violations WHERE driver_id = ?';
    const params = [driverId];
    
    if (start_date && end_date) {
      violationsQuery += ' AND date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    } else if (start_date) {
      violationsQuery += ' AND date >= ?';
      params.push(start_date);
    } else if (end_date) {
      violationsQuery += ' AND date <= ?';
      params.push(end_date);
    }
    
    violationsQuery += ' ORDER BY date DESC';
    const [violationsRows] = await db.query(violationsQuery, params);
    
    // Générer un fichier temporaire basé sur le type de rapport
    let fileName, filePath, attachmentType;
    
    if (report_type === 'pdf' || !report_type) {
      // Générer un PDF
      const PDFDocument = require('pdfkit');
      fileName = `rapport_conducteur_${driverId}_${moment().format('YYYYMMDD')}.pdf`;
      filePath = `./temp/${fileName}`;
      attachmentType = 'application/pdf';
      
      // Assurer que le dossier temp existe
      const fs = require('fs');
      if (!fs.existsSync('./temp')) {
        fs.mkdirSync('./temp');
      }
      
      // Créer le PDF
      const doc = new PDFDocument({ margin: 50 });
      const fileStream = fs.createWriteStream(filePath);
      doc.pipe(fileStream);
      
      // Logo et en-tête
      doc.fontSize(25).text('Karangue 221', { align: 'center' });
      doc.moveDown();
      doc.fontSize(18).text('Rapport de Comportement Conducteur', { align: 'center' });
      doc.moveDown();
      
      // Informations du conducteur
      doc.fontSize(14).text(`Conducteur: ${driver.first_name} ${driver.last_name}`, { align: 'left' });
      doc.fontSize(12).text(`ID: ${driver.id}`, { align: 'left' });
      doc.fontSize(12).text(`Licence: ${driver.license_number || 'Non renseignée'}`, { align: 'left' });
      doc.fontSize(12).text(`Véhicule: ${driver.vehicle || 'Non renseigné'}`, { align: 'left' });
      doc.moveDown();
      
      // Période du rapport
      let periodeText = 'Période: ';
      if (start_date && end_date) {
        periodeText += `Du ${moment(start_date).format('DD/MM/YYYY')} au ${moment(end_date).format('DD/MM/YYYY')}`;
      } else if (start_date) {
        periodeText += `Depuis le ${moment(start_date).format('DD/MM/YYYY')}`;
      } else if (end_date) {
        periodeText += `Jusqu'au ${moment(end_date).format('DD/MM/YYYY')}`;
      } else {
        periodeText += 'Toutes les données disponibles';
      }
      doc.fontSize(12).text(periodeText, { align: 'left' });
      doc.moveDown();
      
      // Statistiques générales
      doc.fontSize(16).text('Statistiques Générales', { align: 'left' });
      doc.moveDown(0.5);
      
      // Calcul du score moyen
      let scoreTotal = 0;
      violationsRows.forEach(v => {
        const day = new Date(v.date);
        const dayViolations = violationsRows.filter(
          viol => new Date(viol.date).toDateString() === day.toDateString()
        ).length;
        scoreTotal += Math.max(0, 100 - 5 * dayViolations);
      });
      
      const scoreGlobal = violationsRows.length > 0 
        ? Math.round(scoreTotal / violationsRows.length) 
        : 100;
      
      // Nombre de violations critiques
      const violationsCritiques = violationsRows.filter(
        v => (v.severity || v.gravite || '').toLowerCase() === 'critique'
      ).length;
      
      // Coût total
      const coutTotal = violationsRows.reduce((sum, v) => sum + (v.cost || 0), 0);
      
      doc.fontSize(12).text(`Score Global: ${scoreGlobal}/100`, { align: 'left' });
      doc.fontSize(12).text(`Nombre Total de Violations: ${violationsRows.length}`, { align: 'left' });
      doc.fontSize(12).text(`Violations Critiques: ${violationsCritiques}`, { align: 'left' });
      doc.fontSize(12).text(`Coût Total: ${coutTotal.toLocaleString('fr-FR')} XOF`, { align: 'left' });
      doc.moveDown();
      
      // Finaliser le document
      doc.end();
      
      // Attendre que le fichier soit écrit
      await new Promise((resolve) => {
        fileStream.on('finish', resolve);
      });
    } else if (report_type === 'csv') {
      // Générer un CSV
      const createCsvWriter = require('csv-writer').createObjectCsvWriter;
      fileName = `violations_conducteur_${driverId}_${moment().format('YYYYMMDD')}.csv`;
      filePath = `./temp/${fileName}`;
      attachmentType = 'text/csv';
      
      // Assurer que le dossier temp existe
      const fs = require('fs');
      if (!fs.existsSync('./temp')) {
        fs.mkdirSync('./temp');
      }
      
      // Configurer le writer CSV
      const csvWriter = createCsvWriter({
        path: filePath,
        header: [
          { id: 'date', title: 'Date' },
          { id: 'type', title: 'Type de Violation' },
          { id: 'severity', title: 'Gravité' },
          { id: 'cost', title: 'Coût (XOF)' },
          { id: 'location', title: 'Lieu' },
          { id: 'description', title: 'Description' }
        ],
        fieldDelimiter: ';'
      });
      
      // Formater les données pour le CSV
      const csvData = violationsRows.map(v => ({
        date: moment(v.date).format('DD/MM/YYYY'),
        type: v.type || 'N/A',
        severity: v.severity || 'N/A',
        cost: v.cost || 0,
        location: v.location || 'N/A',
        description: v.description || 'N/A'
      }));
      
      // Écrire le fichier CSV
      await csvWriter.writeRecords(csvData);
    } else {
      return res.status(400).json({ error: 'Type de rapport non supporté' });
    }
    
    // Configuration du transporteur email
    // Note: Pour la production, utiliser les variables d'environnement
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'user@example.com',
        pass: process.env.SMTP_PASS || 'password'
      }
    });
    
    // Formater les dates pour le sujet
    let dateRange = '';
    if (start_date && end_date) {
      dateRange = `${moment(start_date).format('DD/MM/YYYY')} - ${moment(end_date).format('DD/MM/YYYY')}`;
    } else if (start_date) {
      dateRange = `depuis ${moment(start_date).format('DD/MM/YYYY')}`;
    } else if (end_date) {
      dateRange = `jusqu'au ${moment(end_date).format('DD/MM/YYYY')}`;
    }
    
    // Configurer l'email
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@karangue221.com',
      to: email,
      subject: `Rapport Conducteur: ${driver.first_name} ${driver.last_name} ${dateRange}`,
      text: `Veuillez trouver ci-joint le rapport du conducteur ${driver.first_name} ${driver.last_name} pour la période spécifiée.`,
      html: `
        <h2>Rapport de Comportement du Conducteur</h2>
        <p>Bonjour,</p>
        <p>Veuillez trouver ci-joint le rapport du conducteur <strong>${driver.first_name} ${driver.last_name}</strong> pour la période spécifiée.</p>
        <p>Ce rapport contient des informations sur les violations de conduite, le score global et les statistiques pertinentes.</p>
        <p>Cordialement,<br>L'équipe Karangue 221</p>
      `,
      attachments: [
        {
          filename: fileName,
          path: filePath,
          contentType: attachmentType
        }
      ]
    };
    
    // Envoyer l'email
    const info = await transporter.sendMail(mailOptions);
    
    // Supprimer le fichier temporaire
    const fs = require('fs');
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      message: `Rapport envoyé avec succès à ${email}`,
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du rapport par email:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
};

/**
 * Récupère les violations d'un conducteur avec filtrage par date
 * @param {*} req - Requête Express
 * @param {*} res - Réponse Express
 */
exports.getDriverViolations = async (req, res) => {
  try {
    const driverId = req.params.id;
    const { start_date, end_date } = req.query;
    
    // Construire la requête avec filtrage de date optionnel
    let query = 'SELECT * FROM violations WHERE driver_id = ?';
    const params = [driverId];
    
    if (start_date && end_date) {
      query += ' AND date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    } else if (start_date) {
      query += ' AND date >= ?';
      params.push(start_date);
    } else if (end_date) {
      query += ' AND date <= ?';
      params.push(end_date);
    }
    
    query += ' ORDER BY date DESC';
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des violations du conducteur:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
};

/**
 * Récupère les métriques calculées pour un conducteur
 * @param {*} req - Requête Express
 * @param {*} res - Réponse Express
 */
exports.getDriverMetrics = async (req, res) => {
  try {
    const driverId = req.params.id;
    
    // Récupérer les violations du conducteur
    const [violationsRows] = await db.query(
      'SELECT * FROM violations WHERE driver_id = ?', 
      [driverId]
    );
    
    // Récupérer tous les conducteurs pour la comparaison
    const [driversRows] = await db.query('SELECT * FROM drivers');
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // Violations du mois en cours
    const thisMonthViolations = violationsRows.filter(
      v => new Date(v.date) >= startOfMonth
    );
    
    // Violations du mois précédent
    const lastMonthViolations = violationsRows.filter(
      v => new Date(v.date) >= lastMonth && new Date(v.date) < startOfMonth
    );
    
    // Violations critiques
    const criticalViolations = violationsRows.filter(
      v => (v.severity || v.gravite || '').toLowerCase() === 'critique'
    ).length;
    
    // Coût total des violations
    const totalCost = violationsRows.reduce((sum, v) => sum + (v.cost || 0), 0);
    
    // Calculer les scores pour la timeline
    const timelineData = [];
    for (let i = 0; i < 30; i++) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      const dayViolations = violationsRows.filter(
        v => new Date(v.date).toDateString() === day.toDateString()
      );
      const score = Math.max(0, 100 - 5 * dayViolations.length);
      timelineData.unshift({
        date: day.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        score,
        violations: dayViolations.length
      });
    }
    
    // Calculer le score global
    const overallScore = Math.round(
      timelineData.reduce((sum, d) => sum + d.score, 0) / timelineData.length
    );
    
    // Calculer l'amélioration
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const thisMonthScores = timelineData.slice(-daysInMonth).map(d => d.score);
    const lastMonthScores = timelineData.slice(-2 * daysInMonth, -daysInMonth).map(d => d.score);
    const thisMonthAvg = thisMonthScores.length ? thisMonthScores.reduce((a, b) => a + b, 0) / thisMonthScores.length : 0;
    const lastMonthAvg = lastMonthScores.length ? lastMonthScores.reduce((a, b) => a + b, 0) / lastMonthScores.length : 0;
    const improvement = lastMonthAvg ? Math.round(((thisMonthAvg - lastMonthAvg) / lastMonthAvg) * 100) : 0;
    
    // Calculer la réduction des violations
    const reduction = lastMonthViolations.length
      ? Math.round(((thisMonthViolations.length - lastMonthViolations.length) / lastMonthViolations.length) * 100)
      : 0;
    
    // Calculer la comparaison avec la flotte
    // Simuler des scores pour les autres conducteurs de la flotte
    const driver = driversRows.find(d => d.id === parseInt(driverId));
    const fleetDrivers = driver ? driversRows.filter(d => d.fleet_id === driver.fleet_id) : [];
    const peerDrivers = fleetDrivers.filter(d => d.id !== parseInt(driverId));
    
    // Attribuer des scores aléatoires aux conducteurs sans scores calculés
    const fleetScores = fleetDrivers.map(d => {
      // Dans une implémentation réelle, ceci serait calculé à partir des violations réelles
      // Ici nous utilisons juste une valeur aléatoire pour la démonstration
      return Math.floor(Math.random() * 40) + 60; // Score aléatoire entre 60-100
    });
    
    const fleetAvg = fleetScores.length 
      ? Math.round(fleetScores.reduce((a, b) => a + b, 0) / fleetScores.length) 
      : 0;
    
    const peerScores = peerDrivers.map(d => {
      // Dans une implémentation réelle, ceci serait calculé à partir des violations réelles
      return Math.floor(Math.random() * 40) + 60; // Score aléatoire entre 60-100
    });
    
    const peerAvg = peerScores.length 
      ? Math.round(peerScores.reduce((a, b) => a + b, 0) / peerScores.length) 
      : 0;
    
    // Calculer le classement du conducteur
    const sortedDrivers = [...fleetDrivers].sort((a, b) => {
      // Dans une implémentation réelle, ceci utiliserait des scores réels
      const scoreA = Math.floor(Math.random() * 40) + 60;
      const scoreB = Math.floor(Math.random() * 40) + 60;
      return scoreB - scoreA;
    });
    
    const rank = sortedDrivers.findIndex(d => d.id === parseInt(driverId)) + 1;
    const totalDrivers = sortedDrivers.length;
    
    const comparisonData = [
      { category: 'Score Global', driver: overallScore, fleet: fleetAvg, peer: peerAvg }
    ];
    
    // Construire l'objet de réponse
    const response = {
      criticalViolations,
      totalCost,
      improvement,
      reduction,
      comparisonData,
      rank,
      totalDrivers
    };
    
    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la récupération des métriques du conducteur:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
};

/**
 * Récupère les types de violations disponibles
 * @param {*} req - Requête Express
 * @param {*} res - Réponse Express
 */
exports.getViolationTypes = async (req, res) => {
  try {
    // Dans une implémentation réelle, ceci interrogerait la base de données
    // pour obtenir les types de violations distincts
    const violationTypes = [
      { value: 'speeding', label: 'Excès de vitesse', icon: 'Gauge' },
      { value: 'harsh_braking', label: 'Freinage brusque', icon: 'AlertTriangle' },
      { value: 'harsh_acceleration', label: 'Accélération brusque', icon: 'TrendingUp' },
      { value: 'sharp_cornering', label: 'Virages serrés', icon: 'RotateCcw' },
      { value: 'fatigue', label: 'Fatigue détectée', icon: 'Eye' },
      { value: 'distraction', label: 'Distraction', icon: 'Smartphone' }
    ];
    
    res.json(violationTypes);
  } catch (error) {
    console.error('Erreur lors de la récupération des types de violations:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
};
