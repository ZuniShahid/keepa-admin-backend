import { Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore/lite';
import errors from 'http-errors';

const RequestParamsSchema = Type.Strict(
  Type.Object({
    shopId: Type.String(),
  })
);

const ResponseSchema = Type.Strict(
  Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.String(),
    createdAt: Type.Optional(Type.String()),
    updatedAt: Type.Optional(Type.String()),
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
    sales: Type.Any(),
  })
);

const schema = {
  params: RequestParamsSchema,
  response: {
    200: ResponseSchema,
  },
};

export default async function getShop(fastify: FastifyInstance) {
  fastify.get('/:shopId', { schema }, async (req: FastifyRequest<{ Params: { shopId: string } }>): Promise<any> => {
    const documentRef = doc(fastify.firebase, 'shops', req.params.shopId);

    const shopRef = await getDoc(documentRef);
    if (!shopRef.exists()) {
      throw new errors.NotFound('Shop does not exists');
    }
    const shopData = shopRef.data();

    const productsRef = collection(
      fastify.firebase,
      'sierra leone',
      'shops',
      shopData.name,
      'products',
      'productslist'
    );

    const productDocsRef = await getDocs(productsRef);
    const items = productDocsRef.docs.map((d) => d.data());

    const salesRef = collection(fastify.firebase, 'sierra leone', 'shops', shopData.name, 'sales', 'saleslist');

    const salesDocsRef = await getDocs(salesRef);
    const sales = salesDocsRef.docs.map((d) => d.data()).sort((a, b) => b.timestamp - a.timestamp);

    return {
      ...shopData,
      id: shopRef.id,
      items,
      sales,
    };
  });
}
