import { Type, Static } from '@sinclair/typebox';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { collection, getDocs, query, where } from 'firebase/firestore/lite';
import fs from 'fs';

const ResponseSchema = Type.Strict(
  Type.Object({
    timeStamp: Type.Optional(Type.Number()),
    amount: Type.Number(),
    imgId: Type.String(),
    categoryIdx: Type.Number(),
    name: Type.String(),
    prizeBuy: Type.Number(),
    id: Type.Optional(Type.String()),
    barcode: Type.String(),
    prizeSell: Type.Number(),
  })
);

export type Item = Static<typeof ResponseSchema>;

export default async function updateItem(fastify: FastifyInstance) {
  fastify.put('/:itemId', {}, async (req: FastifyRequest<{ Params: { itemId: string }; Body: Item }>): Promise<any> => {
    const itemsCollectionRef = collection(fastify.firebase, 'sierra leone', 'products', 'productslist');
    const itemsQuerySnapshot = await getDocs(query(itemsCollectionRef, where('__name__', '==', req.params.itemId)));
    const itemsQuerySnapshot2 = await getDocs(query(itemsCollectionRef, where('__name__', '==', '788930203158')));

    const data = itemsQuerySnapshot.docs[0].data();
    const data2 = itemsQuerySnapshot2.docs[0].data();
    console.log(data);
    console.log(data2);
    // const { ref } = itemsQuerySnapshot.docs[0];

    const imagesCollectionRef = collection(fastify.firebase, 'sierra leone', 'products', 'productimages');
    const imagesQuerySnapshot = await getDocs(query(imagesCollectionRef, where('__name__', '==', data.imgId)));
    // const { ref } = imagesQuerySnapshot.docs[0];
    const imagesList = imagesQuerySnapshot.docs.map((doc) => doc.data());
    const image = imagesList[0];
    console.log(image);
    const imagesQuerySnapshot2 = await getDocs(query(imagesCollectionRef, where('__name__', '==', data2.imgId)));
    const imagesList2 = imagesQuerySnapshot2.docs.map((doc) => doc.data());
    const image2 = imagesList2[0];
    console.log(image2);

    // eslint-disable-next-line no-underscore-dangle
    const imgBytes = image.bytes._byteString.binaryString;
    // eslint-disable-next-line no-underscore-dangle
    const imgBytes2 = image2.bytes._byteString.binaryString;

    console.log(imgBytes === imgBytes2);

    const updatedDoc = {
      ...image,
    };
    fs.writeFileSync('aaaatst', Buffer.from(imgBytes2, 'binary'));
    console.log(updatedDoc);
    fs.writeFileSync('output.png', Buffer.from(imgBytes2, 'binary'));

    return updatedDoc;
  });
}
