export const routes = Object.freeze({ queue: '/queue', review: '/review', testConsole: '/test-console', rules: '/rules', insights: '/insights', dataLibrary: '/data' });
export const ticketPath = (id) => `${routes.review}/${encodeURIComponent(id)}`;
export const rulePath = (id) => `${routes.rules}?rule=${encodeURIComponent(id)}`;
