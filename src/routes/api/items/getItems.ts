import { Type, Static } from '@sinclair/typebox';
import { FastifyInstance } from 'fastify';
import { collection, getDocs } from 'firebase/firestore/lite';

const ResponseSchema = Type.Strict(
  Type.Object({
    items: Type.Array(
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
    ),
  })
);

export type Article = Static<typeof ResponseSchema>;

const schema = {
  response: {
    200: ResponseSchema,
  },
};

export default async function getItems(fastify: FastifyInstance) {
  fastify.get('/', { schema }, async (): Promise<any> => {
    const subCollectionRef = collection(fastify.firebase, 'sierra leone', 'products', 'productslist');

    const querySnapshot = await getDocs(subCollectionRef);
    const list = querySnapshot.docs.map((doc) => ({
      id: doc.ref.id,
      ...doc.data(),
    }));

    return { items: list };
  });
}
