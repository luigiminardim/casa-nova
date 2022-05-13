import { endpoint, error, success } from "@luigiminardim/next-endpoint";
import { Client } from "@notionhq/client";
import { Item } from "../../../src/Item";
import { User } from "../../../src/User";

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
  post: {
    handler: async (query, body) => {
      const { id } = query as { id: string };
      const user = body as User;
      const notionItems = await notion.pages.update({
        page_id: id,
        properties: {
          Responsável: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: user.name,
                },
              },
            ],
          },
        },
      });
      return success("ok");
    },
  },
});
