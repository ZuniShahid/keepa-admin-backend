import { Type, Static } from '@sinclair/typebox';
import { FastifyInstance } from 'fastify';
import { collection, getDocs } from 'firebase/firestore/lite';

const ResponseSchema = Type.Strict(
  Type.Array(
    Type.Object({
      id: Type.String({ format: 'uuid' }),
      name: Type.String(),
      createdAt: Type.Optional(Type.String()),
      updatedAt: Type.Optional(Type.String()),
    })
  )
);

export type Article = Static<typeof ResponseSchema>;

const schema = {
  response: {
    200: ResponseSchema,
  },
};

export default async function getShops(fastify: FastifyInstance) {
  fastify.get('/', { schema }, async (): Promise<any> => {
    const collectionRef = collection(fastify.firebase, 'shops');
    const docs = await getDocs(collectionRef);
    return docs.docs.map((d) => {
      const docData = d.data();

      return {
        id: d.id,
        name: docData.name,
        createdAt: docData.createdAt,
        updatedAt: docData.updatedAt,
      };
    });
  });
}
