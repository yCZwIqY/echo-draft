import { index, layout, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  layout('layouts/main-layout.tsx', [
    index('routes/index.tsx'),
    route('workroom', 'routes/work-room.tsx'),
    route('manuscript', 'routes/manuscript.tsx', [route(':id', 'routes/manuscript.detail.tsx')]),
    route('setting', 'routes/setting.tsx'),
  ]),
  route('design-system', 'routes/design-system.tsx'),
] satisfies RouteConfig;
