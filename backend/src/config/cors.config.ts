export const corsConfig = {
  development: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
  ],
  staging: [
    'https://grotn-site-chi.vercel.app',
  ],
  production: [
    'https://grotn.com',
    'https://www.grotn.com',
    'https://app.grotn.com',
    'https://grotn.vercel.app',
    'https://grotn-git-main.vercel.app',
  ],
  // Add any additional domains you might use
  additional: []
};

export const getAllowedOrigins = (): string[] => {
  const origins = [
    ...corsConfig.development,
    ...corsConfig.staging,
    ...corsConfig.production,
    ...corsConfig.additional
  ];
  
  // Remove duplicates
  return [...new Set(origins)];
};

export const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = getAllowedOrigins();
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
};
