// Service Multi-Tenant Frontend pour Karangué221

class TenantService {
  constructor() {
    this.currentTenant = null;
    this.tenantConfig = {
      // Configuration par défaut
      defaultTenantId: '1',
      supportedMethods: ['subdomain', 'header', 'query']
    };
    
    this.init();
  }

  /**
   * Initialise le service tenant
   */
  init() {
    this.detectTenant();
    this.setupRequestInterceptors();
  }

  /**
   * Détecte le tenant actuel à partir de l'URL ou des paramètres
   */
  detectTenant() {
    // Méthode 1: Sous-domaine
    const subdomain = this.extractSubdomain();
    if (subdomain) {
      this.currentTenant = {
        type: 'subdomain',
        identifier: subdomain,
        method: 'subdomain'
      };
      console.log('🏢 Tenant détecté via sous-domaine:', subdomain);
      return;
    }

    // Méthode 2: Paramètre URL
    const urlParams = new URLSearchParams(window.location.search);
    const tenantId = urlParams.get('tenant_id');
    const tenantSubdomain = urlParams.get('tenant_subdomain');

    if (tenantId) {
      this.currentTenant = {
        type: 'id',
        identifier: tenantId,
        method: 'query'
      };
      console.log('🏢 Tenant détecté via paramètre tenant_id:', tenantId);
      return;
    }

    if (tenantSubdomain) {
      this.currentTenant = {
        type: 'subdomain',
        identifier: tenantSubdomain,
        method: 'query'
      };
      console.log('🏢 Tenant détecté via paramètre tenant_subdomain:', tenantSubdomain);
      return;
    }

    // Méthode 3: Configuration stockée localement
    const storedTenant = localStorage.getItem('currentTenant');
    if (storedTenant) {
      try {
        this.currentTenant = JSON.parse(storedTenant);
        console.log('🏢 Tenant restauré depuis localStorage:', this.currentTenant);
        return;
      } catch (error) {
        console.warn('Erreur lors de la restauration du tenant depuis localStorage:', error);
        localStorage.removeItem('currentTenant');
      }
    }

    // Fallback: Tenant par défaut en développement
    if (process.env.NODE_ENV === 'development') {
      this.currentTenant = {
        type: 'id',
        identifier: this.tenantConfig.defaultTenantId,
        method: 'default'
      };
      console.log('🏢 Tenant par défaut (développement):', this.currentTenant);
    }
  }

  /**
   * Extrait le sous-domaine de l'URL actuelle
   */
  extractSubdomain() {
    const hostname = window.location.hostname;
    
    // Ignorer localhost en développement
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return null;
    }

    const parts = hostname.split('.');
    
    // Pour karangue221.com, on attend sous-domaine.karangue221.com
    if (parts.length >= 3) {
      const subdomain = parts[0];
      // Ignorer les sous-domaines système
      if (!['www', 'api', 'admin', 'static'].includes(subdomain)) {
        return subdomain;
      }
    }

    return null;
  }

  /**
   * Configure les intercepteurs de requête pour ajouter automatiquement les en-têtes tenant
   */
  setupRequestInterceptors() {
    // Cette méthode sera appelée par les services API pour ajouter les en-têtes
    console.log('🔧 Intercepteurs tenant configurés');
  }

  /**
   * Retourne les en-têtes tenant pour les requêtes API
   */
  getTenantHeaders() {
    if (!this.currentTenant) {
      return {};
    }

    const headers = {};

    if (this.currentTenant.type === 'id') {
      headers['X-Tenant-ID'] = this.currentTenant.identifier;
    } else if (this.currentTenant.type === 'subdomain') {
      headers['X-Tenant-Subdomain'] = this.currentTenant.identifier;
    }

    return headers;
  }

  /**
   * Retourne les paramètres URL pour les requêtes en fallback
   */
  getTenantQueryParams() {
    if (!this.currentTenant) {
      return {};
    }

    const params = {};

    if (this.currentTenant.type === 'id') {
      params.tenant_id = this.currentTenant.identifier;
    } else if (this.currentTenant.type === 'subdomain') {
      params.tenant_subdomain = this.currentTenant.identifier;
    }

    return params;
  }

  /**
   * Change le tenant actuel
   */
  setTenant(type, identifier) {
    this.currentTenant = {
      type,
      identifier,
      method: 'manual'
    };

    // Sauvegarder dans localStorage
    localStorage.setItem('currentTenant', JSON.stringify(this.currentTenant));
    
    console.log('🏢 Tenant changé:', this.currentTenant);
  }

  /**
   * Obtient les informations du tenant actuel
   */
  getCurrentTenant() {
    return this.currentTenant;
  }

  /**
   * Vérifie si un tenant est configuré
   */
  hasTenant() {
    return this.currentTenant !== null;
  }

  /**
   * Génère l'URL pour un tenant spécifique
   */
  generateTenantUrl(subdomain, path = '') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // En développement, utiliser des paramètres URL
      const baseUrl = `${protocol}//${hostname}:${window.location.port}`;
      const url = new URL(path, baseUrl);
      url.searchParams.set('tenant_subdomain', subdomain);
      return url.toString();
    } else {
      // En production, utiliser des sous-domaines
      const baseDomain = hostname.includes('karangue221.com') 
        ? 'karangue221.com' 
        : hostname;
      return `${protocol}//${subdomain}.${baseDomain}${path}`;
    }
  }

  /**
   * Navigue vers un tenant spécifique
   */
  navigateToTenant(subdomain, path = '/') {
    const url = this.generateTenantUrl(subdomain, path);
    window.location.href = url;
  }

  /**
   * Efface les données du tenant
   */
  clearTenant() {
    this.currentTenant = null;
    localStorage.removeItem('currentTenant');
    console.log('🏢 Données tenant effacées');
  }

  /**
   * Valide la configuration du tenant avec le backend
   */
  async validateTenant() {
    if (!this.currentTenant) {
      throw new Error('Aucun tenant configuré');
    }

    try {
      const response = await fetch('/api/tenants/current', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getTenantHeaders()
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur de validation tenant: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Tenant validé:', data.tenant);
      return data.tenant;
    } catch (error) {
      console.error('❌ Erreur de validation tenant:', error);
      throw error;
    }
  }

  /**
   * Obtient la liste des tenants disponibles (pour les administrateurs)
   */
  async getAvailableTenants() {
    try {
      const response = await fetch('/api/tenants', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          ...this.getTenantHeaders()
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des tenants: ${response.status}`);
      }

      const data = await response.json();
      return data.tenants || [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des tenants:', error);
      return [];
    }
  }
}

// Instance singleton
const tenantService = new TenantService();

export default tenantService;
