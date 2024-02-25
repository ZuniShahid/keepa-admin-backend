import { Type, Static } from '@sinclair/typebox';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { collection, getDocs, query, where } from 'firebase/firestore/lite';

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
    image: Type.String(),
  })
);

export type Article = Static<typeof ResponseSchema>;

const schema = {
  response: {
    200: ResponseSchema,
  },
};

export default async function getItem(fastify: FastifyInstance) {
  fastify.get('/:itemId', { schema }, async (req: FastifyRequest<{ Params: { itemId: string } }>): Promise<any> => {
    const itemsCollectionRef = collection(fastify.firebase, 'sierra leone', 'products', 'productslist');
    const itemsQuerySnapshot = await getDocs(query(itemsCollectionRef, where('__name__', '==', req.params.itemId)));
    const itemsList: any = itemsQuerySnapshot.docs.map((doc) => ({
      id: doc.ref.id,
      ...doc.data(),
    }));
    const product = itemsList[0]

    const imagesCollectionRef = collection(fastify.firebase, 'sierra leone', 'products', 'productimages');
    const imagesQuerySnapshot = await getDocs(query(imagesCollectionRef, where('__name__', '==', product.imgId)));
    const imagesList = imagesQuerySnapshot.docs.map((doc) => doc.data());
    const image = imagesList[0];
    // eslint-disable-next-line no-underscore-dangle
    const imgBytes = image.bytes._byteString.binaryString;

    return {
      amount: product.amount,
      imgId: product.imgId,
      categoryIdx: product.categoryIdx,
      name: product.name,
      prizeBuy: product.prizeBuy,
      barcode: product.barcode,
      prizeSell: product.prizeSell,
      image: imgBytes,
    };
  });
}
