import { createClient } from 'contentful';

export const contentfulClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!
});

export interface AnnouncementPoster {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  width: number;
  height: number;
}

export async function getAnnouncementPosters(): Promise<AnnouncementPoster[]> {
  const entries = await contentfulClient.getEntries({
    content_type: 'hataweAnnouncements',
    order: ['-sys.createdAt']
  });

  return entries.items.map(item => {
    const poster = item.fields.poster as any;
    return {
      id: item.sys.id,
      title: poster.fields.title as string,
      description: (poster.fields.description as string) ?? '',
      imageUrl: `https:${poster.fields.file.url}`,
      width: poster.fields.file.details.image.width as number,
      height: poster.fields.file.details.image.height as number
    };
  });
}
