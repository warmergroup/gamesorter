import type {Item} from '~/types/item';

export default defineEventHandler(async (event) => {
  // Simulate delay for realistic API behavior
  await new Promise(resolve => setTimeout(resolve, 300));

  // Mock data for the API
  const items: Item[] = [
    {
      id: '1',
      name: 'DOTA2',
      order: 1,
      categories: 'Head / Weapon / Back / Shoulders / Arms / Bracers / Collection / Event',
      childCount: 9,
      children: []
    },
    {
      id: '2',
      name: 'CS2',
      order: 2,
      categories: 'Gloves / Heavy / Knives / Pistols / Rifles / SMGs',
      childCount: 6,
      children: [
        {
          id: '2.1',
          name: 'Gloves',
          order: 1,
          children: []
        },
        {
          id: '2.2',
          name: 'Heavy',
          order: 2,
          children: []
        },
        {
          id: '2.3',
          name: 'Knives',
          order: 3,
          children: []
        },
        {
          id: '2.4',
          name: 'Pistols',
          order: 4,
          children: []
        },
        {
          id: '2.5',
          name: 'Rifles',
          order: 5,
          children: []
        },
      ]
    },
    {
      id: '3',
      name: 'Minecraft',
      order: 3,
      categories: 'Blocks / Items / Skins / Textures',
      childCount: 4,
      children: []
    },
    {
      id: '4',
      name: 'RUST',
      order: 4,
      categories: '',
      childCount: 0,
      children: [
        {
          id: '4.1',
          name: 'Heavy',
          order: 1,
          children: []
        },
        {
          id: '4.2',
          name: 'Knives',
          order: 2,
          children: []
        },
        {
          id: '4.3',
          name: 'Pistols',
          order: 3,
          children: []
        },
      ]
    }
  ];

  // Generate additional mock items for pagination
  for (let i = 5; i <= 70; i++) {
    items.push({
      id: i.toString(),
      name: `Game ${i}`,
      order: i,
      categories: '',
      childCount: 0,
      children: []
    });
  }

  // Get query parameters for pagination
  const query = getQuery(event);
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;

  const start = (page - 1) * limit;
  const end = start + limit;

  // For the API, just return the first 10 items to simplify
  // In a real implementation, you would paginate properly
  return {
    items,
    total: items.length,
    page,
    limit
  };
});