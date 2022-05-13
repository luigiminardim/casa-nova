import { endpoint, error, success } from "@luigiminardim/next-endpoint";
import { Client } from "@notionhq/client";
import { Item } from "../../../src/Item";

function extractResponsableUser(notionItem: any): Item["responsableUser"] {
  const name =
    notionItem?.properties?.["Responsável"]?.rich_text?.[0]?.plain_text ?? null;
  if (!name) {
    return null;
  }
  return {
    name,
  };
}

async function extractItem(notionItem: any): Promise<Item> {
  const exampleUrl = (notionItem?.properties?.Exemplo?.url ?? null) as
    | string
    | null;
  return {
    id: notionItem?.id ?? "",
    exampleUrl: exampleUrl ?? "",
    name: notionItem?.properties?.Name.title?.[0].plain_text ?? "",
    responsableUser: extractResponsableUser(notionItem),
  };
}

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export default endpoint({
  get: {
    handler: async () => {
      const notionItems = await notion.databases.query({
        database_id: "8dc1eac9be3646e5ab34ab619476afdd",
      });
      try {
        const items = await Promise.all(notionItems.results.map(extractItem));
        return success(items);
      } catch (e) {
        return error(400, JSON.stringify(e));
      }
    },
  },
});
