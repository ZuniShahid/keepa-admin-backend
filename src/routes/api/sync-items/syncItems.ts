import { FastifyInstance } from 'fastify';
import { collection, getDocs, query, updateDoc } from 'firebase/firestore/lite';
import { getStorage, listAll, ref, uploadBytes } from 'firebase/storage';

const productCategories = [
  {
    name: 'Misc',
    uuid: 'e7c9b83c-7d91-4c49-9d8c-cbdc9fdb9cda',
  },
  {
    name: 'Food',
    uuid: 'fc157ea5-3d60-4507-8ee1-8396b44149c9',
  },
  {
    name: 'Fruit',
    uuid: 'b218016f-ca4b-4eb9-b943-0152c0129b80',
  },
  {
    name: 'Drink',
    uuid: 'd179cd66-51d6-4bbc-b686-f21158f64ead',
  },
  {
    name: 'Beauty care',
    uuid: 'de76e5b0-3b73-467a-a472-4f6076279158',
  },
  {
    name: 'Alcohol',
    uuid: '5c77ca29-8cb7-45d3-8ae4-ff4b37415158',
  },
  {
    name: 'Detergents home care',
    uuid: '3f401014-7dee-4bd7-9628-34bcbd945f3a',
  },
  {
    name: 'Kitchen essentials',
    uuid: '4a48ba65-3ae9-46e7-af61-bc317ab36f51',
  },
  {
    name: 'Dry food',
    uuid: '8f97c3b1-80e1-4386-bd6a-a897595ed7cc',
  },
  {
    name: 'Fresh food',
    uuid: '2265eef4-ebc9-43a8-b76d-5a14066fdef4',
  },
  {
    name: 'Drugstore',
    uuid: '7fba7e78-36d2-492e-a38b-1ab0380c70c2',
  },
  {
    name: 'Snacks',
    uuid: 'eebc39d7-4be6-4578-ba6b-6133a525c1f6',
  },
];

export default async function syncItems(fastify: FastifyInstance) {
  fastify.post('/', {}, async (): Promise<any> => {
    const subCollectionRef = collection(fastify.firebase, 'sierra leone', 'products', 'productimages');

    const querySnapshot = await getDocs(query(subCollectionRef));
    const imagesList: any = querySnapshot.docs.map((doc) => ({
      id: doc.ref.id,
      ...doc.data(),
    }));

    const storage = getStorage();
    const storageRef = ref(storage, 'images');

    const itemReferences = await listAll(storageRef);
    const itemNames = itemReferences.items.reduce<Record<string, boolean>>((prev, curr) => {
      // eslint-disable-next-line no-param-reassign
      prev[curr.name] = true;
      return prev;
    }, {});

    let imagePath;
    // eslint-disable-next-line no-restricted-syntax
    for (const el of imagesList) {
      if (el.id in itemNames) {
        // eslint-disable-next-line no-continue
        continue;
      }
      // eslint-disable-next-line no-underscore-dangle
      const { binaryString } = el.bytes._byteString;
      imagePath = `images/${el.id}`;

      console.log('Uploading image for', imagePath);

      const storageRef = ref(storage, imagePath);
      const buffer = Buffer.from(binaryString, 'binary');
      try {
        // eslint-disable-next-line no-await-in-loop
        await uploadBytes(storageRef, buffer, {
          contentType: 'image/png',
        });
      } catch (e) {
        console.error('FAILED adding image:', imagePath);
      }
    }

    const itemsCollectionRef = collection(fastify.firebase, 'sierra leone', 'products', 'productslist');
    const itemsQuerySnapshot = await getDocs(query(itemsCollectionRef));

    let categoryUuid;
    let itemId;
    // eslint-disable-next-line no-restricted-syntax
    for (const itemRef of itemsQuerySnapshot.docs) {
      const data = itemRef.data();
      // eslint-disable-next-line no-continue
      if (!data.categoryIdx || data.categoryUuid) continue;

      categoryUuid = productCategories[data.categoryIdx].uuid;
      const { ref } = itemRef;
      const updatedDoc = {
        ...data,
        categoryUuid,
      };

      itemId = ref.id;
      console.log(`Updating item category ${categoryUuid} for item ${itemId}`);

      try {
        // eslint-disable-next-line no-await-in-loop
        await updateDoc(ref, updatedDoc);
      } catch (e) {
        itemId = ref.id;
        console.error(`Failed to update item category ${categoryUuid} for item ${itemId}`);
      }
    }

    return 'Sync successful';
  });
}
