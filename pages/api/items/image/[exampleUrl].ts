import { endpoint, Middleware, success } from "@luigiminardim/next-endpoint";
import { ItemImage } from "../../../../src/Item";
// @ts-ignore
import openGraph from "open-graph";

async function extractImage(url: string): Promise<ItemImage | null> {
  return new Promise((resolve, reject) => {
    openGraph(url, (err: unknown, data: any) => {
      if (err || !data) {
        resolve(null);
      } else {
        const imageUrl = data?.image?.url ?? null;
        const width = data?.image?.width ?? null;
        const height = data?.image?.height ?? null;
        resolve({ url: imageUrl, width, height });
      }
    });
  });
}

const vercelCacheMiddleware: Middleware = (req, res, next) => {
  const _1week = 7 * 24 * 60 * 60;
  res.setHeader("Cache-Control", `max-age=${_1week}, public`);
  next();
};

export default endpoint({
  get: {
    use: [vercelCacheMiddleware],
    handler: async (query) => {
      const { exampleUrl } = query as { exampleUrl: string };
      const itemImage = await extractImage(exampleUrl);
      return success(itemImage);
    },
  },
});
