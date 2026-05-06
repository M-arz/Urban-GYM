import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── CORS ────────────────────────────────────────────────────────────────
  // En producción, establece FRONTEND_URL con el dominio exacto de Vercel
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-internal-key'],
    credentials: true,
  });

  const memberServiceUrl =
    process.env.MEMBER_SERVICE_URL || 'http://localhost:3001';
  const bookingServiceUrl =
    process.env.BOOKING_SERVICE_URL || 'http://localhost:3002';
  const facilityServiceUrl =
    process.env.FACILITY_SERVICE_URL || 'http://localhost:3003';
  const iotServiceUrl = process.env.IOT_SERVICE_URL || 'http://localhost:3004';
  const progressServiceUrl =
    process.env.PROGRESS_SERVICE_URL || 'http://localhost:3005';
  const billingServiceUrl =
    process.env.BILLING_SERVICE_URL || 'http://localhost:3006';

  // Proxy → member-service (conserva el path completo)
  app.use(
    '/auth',
    createProxyMiddleware({
      target: memberServiceUrl,
      changeOrigin: true,
      pathRewrite: { '^/': '/auth/' },
    }),
  );
  app.use(
    '/members',
    createProxyMiddleware({
      target: memberServiceUrl,
      changeOrigin: true,
      pathRewrite: { '^/': '/members/' },
    }),
  );

  // Proxy → booking-service
  // IMPORTANTE: BookingsController usa @Controller() sin prefijo, por lo que
  // las rutas /classes, /schedules, /bookings, /waitlist existen en la raíz
  // del servicio. NO se usa pathRewrite para evitar doble prefijo:
  //   Sin pathRewrite: Express strip /classes → proxy recibe / → reenvía /classes ✓
  //   Con pathRewrite: Express strip /classes → proxy recibe / → reescribe a /classes/ → servicio recibe /classes/classes ✗
  app.use(
    '/waitlist',
    createProxyMiddleware({
      target: bookingServiceUrl,
      changeOrigin: true,
    }),
  );
  app.use(
    '/classes',
    createProxyMiddleware({
      target: bookingServiceUrl,
      changeOrigin: true,
    }),
  );
  app.use(
    '/schedules',
    createProxyMiddleware({
      target: bookingServiceUrl,
      changeOrigin: true,
    }),
  );
  app.use(
    '/bookings',
    createProxyMiddleware({
      target: bookingServiceUrl,
      changeOrigin: true,
    }),
  );

  // Proxy → facility-service
  app.use(
    '/gyms',
    createProxyMiddleware({
      target: facilityServiceUrl,
      changeOrigin: true,
      pathRewrite: { '^/': '/gyms/' },
    }),
  );
  app.use(
    '/equipment',
    createProxyMiddleware({
      target: facilityServiceUrl,
      changeOrigin: true,
      pathRewrite: { '^/': '/equipment/' },
    }),
  );

  // Proxy → iot-service
  app.use(
    '/machines',
    createProxyMiddleware({
      target: iotServiceUrl,
      changeOrigin: true,
      pathRewrite: { '^/': '/machines/' },
    }),
  );
  app.use(
    '/workouts',
    createProxyMiddleware({
      target: iotServiceUrl,
      changeOrigin: true,
      pathRewrite: { '^/': '/workouts/' },
    }),
  );

  // Proxy → workout-progress-service
  app.use(
    '/progress',
    createProxyMiddleware({
      target: progressServiceUrl,
      changeOrigin: true,
      pathRewrite: { '^/': '/progress/' },
    }),
  );

  // Proxy → billing-service
  app.use(
    '/billing',
    createProxyMiddleware({
      target: billingServiceUrl,
      changeOrigin: true,
      pathRewrite: { '^/': '/billing/' },
    }),
  );

  const recommendationServiceUrl = process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:3007';

  // Proxy → recommendation-service
  app.use(
    '/recommendations',
    createProxyMiddleware({
      target: recommendationServiceUrl,
      changeOrigin: true,
      pathRewrite: { '^/': '/recommendations/' },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  console.log(`API Gateway corriendo en puerto ${process.env.PORT ?? 3000}`);
  console.log(`  → Member Service:    ${memberServiceUrl}`);
  console.log(`  → Booking Service:   ${bookingServiceUrl}`);
  console.log(`  → Facility Service:  ${facilityServiceUrl}`);
  console.log(`  → IoT Service:       ${iotServiceUrl}`);
  console.log(`  → Progress Service:  ${progressServiceUrl}`);
  console.log(`  → Billing Service:   ${billingServiceUrl}`);
  console.log(`  → Recommendation Svc:${recommendationServiceUrl}`);
}
void bootstrap();
