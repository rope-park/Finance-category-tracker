import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { Express } from 'express';

export const initSentry = (app: Express) => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    integrations: [
      // HTTP Integration
      Sentry.httpIntegration(),
      
      // Profiling Integration
      nodeProfilingIntegration(),
      
      // Express Integration
      Sentry.expressIntegration(),
    ],
    
    // Error Filtering
    beforeSend(event, hint) {
      // Filter out certain errors in production
      if (process.env.NODE_ENV === 'production') {
        const error = hint.originalException;
        
        // Ignore 404 errors
        if (event.request?.url && event.tags?.['http.status_code'] === '404') {
          return null;
        }
        
        // Ignore certain error types
        if (error instanceof Error) {
          if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
            return null;
          }
        }
      }
      
      return event;
    },
    
    // Additional options
    release: process.env.npm_package_version,
    serverName: process.env.SERVER_NAME || 'finance-tracker-backend',
  });

  // Request handler must be the first middleware
  app.use(Sentry.expressErrorHandler());

  return Sentry;
};

export const captureException = Sentry.captureException;
export const captureMessage = Sentry.captureMessage;
export const addBreadcrumb = Sentry.addBreadcrumb;
export const setUser = Sentry.setUser;
export const setTag = Sentry.setTag;
export const setContext = Sentry.setContext;
