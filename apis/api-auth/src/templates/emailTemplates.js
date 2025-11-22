const emailTemplates = {
  // Template de base responsive
  baseTemplate: (content, title) => `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        /* Reset CSS */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        /* Base styles */
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333333;
          background-color: #f8f9fa;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        
        .header h1 {
          font-size: 28px;
          margin: 0;
          font-weight: 600;
        }
        
        .header .logo {
          font-size: 48px;
          margin-bottom: 10px;
        }
        
        .content {
          padding: 40px 30px;
          background: #ffffff;
        }
        
        .content h2 {
          color: #2d3748;
          font-size: 24px;
          margin-bottom: 20px;
          font-weight: 600;
        }
        
        .content p {
          margin-bottom: 16px;
          color: #4a5568;
          font-size: 16px;
        }
        
        .button {
          display: inline-block;
          padding: 16px 32px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white !important;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
          transition: all 0.2s ease;
        }
        
        .button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .button-danger {
          background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
        }
        
        .button-success {
          background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
        }
        
        .code-box {
          background: #f7fafc;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        }
        
        .verification-code {
          font-size: 32px;
          font-weight: bold;
          color: #2d3748;
          letter-spacing: 4px;
          font-family: 'Courier New', monospace;
        }
        
        .warning-box {
          background: #fffbeb;
          border-left: 4px solid #f6ad55;
          padding: 16px 20px;
          margin: 20px 0;
          border-radius: 0 6px 6px 0;
        }
        
        .success-box {
          background: #f0fff4;
          border-left: 4px solid #48bb78;
          padding: 16px 20px;
          margin: 20px 0;
          border-radius: 0 6px 6px 0;
        }
        
        .info-box {
          background: #ebf8ff;
          border-left: 4px solid #4299e1;
          padding: 16px 20px;
          margin: 20px 0;
          border-radius: 0 6px 6px 0;
        }
        
        .footer {
          background: #f7fafc;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        
        .footer p {
          color: #718096;
          font-size: 14px;
          margin-bottom: 8px;
        }
        
        .social-links {
          margin: 20px 0;
        }
        
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          color: #718096;
          text-decoration: none;
        }
        
        .divider {
          height: 1px;
          background: #e2e8f0;
          margin: 30px 0;
        }
        
        /* Responsive */
        @media only screen and (max-width: 600px) {
          .container { margin: 10px; }
          .header, .content, .footer { padding: 20px; }
          .header h1 { font-size: 24px; }
          .content h2 { font-size: 20px; }
          .button { display: block; text-align: center; }
          .verification-code { font-size: 24px; }
        }
      </style>
    </head>
    <body>
      <div style="padding: 20px 0;">
        <div class="container">
          ${content}
        </div>
      </div>
    </body>
    </html>
  `,

  // Template de vérification email amélioré
  emailVerification: (verificationUrl, firstName, code) => {
    const content = `
      <div class="header">
        <div class="logo">🏠</div>
        <h1>Viridial Real Estate</h1>
      </div>
      
      <div class="content">
        <h2>Bonjour ${firstName || 'Cher utilisateur'} !</h2>
        
        <p>Bienvenue sur <strong>Viridial Real Estate</strong> ! Nous sommes ravis de vous compter parmi nous.</p>
        
        <p>Pour finaliser votre inscription et sécuriser votre compte, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
        
        <div style="text-align: center;">
          <a href="${verificationUrl}" class="button">✅ Vérifier mon email</a>
        </div>
        
        ${code ? `
          <div class="info-box">
            <p><strong>Ou utilisez ce code de vérification :</strong></p>
            <div class="code-box">
              <div class="verification-code">${code}</div>
            </div>
          </div>
        ` : ''}
        
        <div class="divider"></div>
        
        <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
        <p style="word-break: break-all; color: #667eea;"><a href="${verificationUrl}">${verificationUrl}</a></p>
        
        <div class="warning-box">
          <p><strong>⚠️ Important :</strong> Ce lien expire dans <strong>24 heures</strong> pour votre sécurité.</p>
        </div>
        
        <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email en toute sécurité.</p>
      </div>
      
      <div class="footer">
        <p><strong>Pourquoi vérifier votre email ?</strong></p>
        <p>• Sécuriser votre compte<br>• Recevoir des notifications importantes<br>• Récupérer votre mot de passe si nécessaire</p>
        
        <div class="social-links">
          <a href="https://viridial.com/contact">📧 Support</a>
          <a href="https://viridial.com/privacy">🔒 Confidentialité</a>
          <a href="https://viridial.com">🌐 Site web</a>
        </div>
        
        <p>© 2025 Viridial Real Estate. Tous droits réservés.</p>
        <p>Casablanca, Maroc</p>
      </div>
    `;
    
    return emailTemplates.baseTemplate(content, 'Vérifiez votre adresse email - Viridial');
  },

  // Template de réinitialisation mot de passe
  passwordReset: (resetUrl, firstName, expiresIn = '10 minutes') => {
    const content = `
      <div class="header">
        <div class="logo">🔐</div>
        <h1>Réinitialisation de mot de passe</h1>
      </div>
      
      <div class="content">
        <h2>Bonjour ${firstName || 'Cher utilisateur'},</h2>
        
        <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Viridial Real Estate.</p>
        
        <p>Si vous êtes à l'origine de cette demande, cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
        
        <div style="text-align: center;">
          <a href="${resetUrl}" class="button button-danger">🔄 Réinitialiser mon mot de passe</a>
        </div>
        
        <div class="divider"></div>
        
        <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
        <p style="word-break: break-all; color: #f56565;"><a href="${resetUrl}">${resetUrl}</a></p>
        
        <div class="warning-box">
          <p><strong>⏰ Attention :</strong> Ce lien expire dans <strong>${expiresIn}</strong> pour votre sécurité.</p>
        </div>
        
        <div class="info-box">
          <p><strong>🛡️ Conseils de sécurité :</strong></p>
          <p>• Utilisez un mot de passe fort et unique<br>• Combinez lettres, chiffres et symboles<br>• Évitez les informations personnelles</p>
        </div>
        
        <p><strong>Vous n'avez pas demandé cette réinitialisation ?</strong><br>
        Ignorez cet email, votre mot de passe restera inchangé. Si vous recevez plusieurs emails de ce type, contactez-nous immédiatement.</p>
      </div>
      
      <div class="footer">
        <p><strong>Besoin d'aide ?</strong></p>
        <p>Notre équipe support est là pour vous aider 24/7</p>
        
        <div class="social-links">
          <a href="mailto:support@viridial.com">📧 support@viridial.com</a>
          <a href="tel:+212522000000">📞 +212 522 000 000</a>
        </div>
        
        <p>© 2025 Viridial Real Estate. Tous droits réservés.</p>
      </div>
    `;
    
    return emailTemplates.baseTemplate(content, 'Réinitialisation de mot de passe - Viridial');
  },

  // Template de bienvenue
  welcome: (firstName, loginUrl) => {
    const content = `
      <div class="header">
        <div class="logo">🎉</div>
        <h1>Bienvenue chez Viridial !</h1>
      </div>
      
      <div class="content">
        <h2>Félicitations ${firstName} !</h2>
        
        <p>Votre compte a été créé avec succès. Bienvenue dans la famille <strong>Viridial Real Estate</strong> !</p>
        
        <div class="success-box">
          <p><strong>✅ Votre compte est maintenant actif</strong></p>
          <p>Vous pouvez dès maintenant profiter de tous nos services.</p>
        </div>
        
        <h3 style="color: #2d3748; margin: 30px 0 20px 0;">🚀 Que pouvez-vous faire maintenant ?</h3>
        
        <div style="margin: 20px 0;">
          <p><strong>🔍 Rechercher des biens</strong><br>
          Explorez notre vaste catalogue de propriétés</p>
          
          <p><strong>❤️ Sauvegarder vos favoris</strong><br>
          Créez votre liste de biens coups de cœur</p>
          
          <p><strong>📧 Contacter les agents</strong><br>
          Échangez directement avec nos experts</p>
          
          <p><strong>🔔 Configurer des alertes</strong><br>
          Soyez notifié des nouveaux biens qui vous intéressent</p>
          
          <p><strong>👤 Gérer votre profil</strong><br>
          Personnalisez vos préférences et informations</p>
        </div>
        
        <div style="text-align: center;">
          <a href="${loginUrl}" class="button button-success">🏠 Commencer à explorer</a>
        </div>
        
        <div class="info-box">
          <p><strong>💡 Conseil :</strong> Complétez votre profil pour une expérience personnalisée et des recommandations adaptées à vos besoins.</p>
        </div>
      </div>
      
      <div class="footer">
        <p><strong>Restez connecté avec nous</strong></p>
        
        <div class="social-links">
          <a href="https://viridial.com/guide">📚 Guide utilisateur</a>
          <a href="https://viridial.com/blog">📰 Blog immobilier</a>
          <a href="https://viridial.com/contact">💬 Support client</a>
        </div>
        
        <p>Suivez-nous sur nos réseaux sociaux pour les dernières actualités immobilières !</p>
        
        <p>© 2025 Viridial Real Estate. Tous droits réservés.</p>
        <p>Votre partenaire immobilier de confiance au Maroc</p>
      </div>
    `;
    
    return emailTemplates.baseTemplate(content, 'Bienvenue chez Viridial Real Estate !');
  },

  // Template de notification de connexion suspecte
  suspiciousLogin: (firstName, loginDetails) => {
    const { ip, location, device, timestamp } = loginDetails;
    
    const content = `
      <div class="header" style="background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);">
        <div class="logo">⚠️</div>
        <h1>Alerte de sécurité</h1>
      </div>
      
      <div class="content">
        <h2>Bonjour ${firstName},</h2>
        
        <p>Nous avons détecté une connexion inhabituelle sur votre compte Viridial Real Estate.</p>
        
        <div class="warning-box">
          <p><strong>📋 Détails de la connexion :</strong></p>
          <p><strong>📅 Date :</strong> ${timestamp}<br>
          <strong>📍 Localisation :</strong> ${location || 'Inconnue'}<br>
          <strong>💻 Appareil :</strong> ${device || 'Inconnu'}<br>
          <strong>🌐 Adresse IP :</strong> ${ip}</p>
        </div>
        
        <h3 style="color: #e53e3e;">🔐 Que faire ?</h3>
        
        <p><strong>Si c'était vous :</strong><br>
        Vous pouvez ignorer cet email. Votre compte est sécurisé.</p>
        
        <p><strong>Si ce n'était pas vous :</strong><br>
        Changez immédiatement votre mot de passe et contactez notre support.</p>
        
        <div style="text-align: center;">
          <a href="https://viridial.com/change-password" class="button button-danger">🔄 Changer mon mot de passe</a>
        </div>
        
        <div class="info-box">
          <p><strong>🛡️ Recommandations de sécurité :</strong></p>
          <p>• Utilisez un mot de passe unique et fort<br>
          • Activez la double authentification<br>
          • Ne partagez jamais vos identifiants<br>
          • Déconnectez-vous des appareils publics</p>
        </div>
      </div>
      
      <div class="footer">
        <p><strong>🆘 Besoin d'aide urgente ?</strong></p>
        <p>Contactez immédiatement notre équipe sécurité</p>
        
        <div class="social-links">
          <a href="mailto:security@viridial.com">🚨 security@viridial.com</a>
          <a href="tel:+212522000000">📞 Support urgence</a>
        </div>
        
        <p>© 2025 Viridial Real Estate - Équipe Sécurité</p>
      </div>
    `;
    
    return emailTemplates.baseTemplate(content, 'Alerte de sécurité - Viridial');
  }
};

module.exports = emailTemplates;