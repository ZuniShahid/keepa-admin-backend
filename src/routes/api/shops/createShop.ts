import { Type, Static } from '@sinclair/typebox';
import { randomUUID } from 'crypto';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { setDoc, doc, collection } from 'firebase/firestore/lite';

const RequestSchema = Type.Strict(
  Type.Object({
    name: Type.String(),
  })
);

const ResponseSchema = Type.Strict(
  Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.String(),
    createdAt: Type.String(),
    updatedAt: Type.String(),
  })
);

export type Category = Static<typeof ResponseSchema>;

const schema = {
  body: RequestSchema,
  response: {
    200: ResponseSchema,
  },
};

export default async function createShop(fastify: FastifyInstance) {
  fastify.post('/', { schema }, async (req: FastifyRequest<{ Body: { name: string } }>): Promise<any> => {
    const newCollectionRef = collection(fastify.firebase, 'shops');

    const docId = randomUUID();
    const documentRef = doc(newCollectionRef, docId);
    const data = {
      name: req.body.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDoc(documentRef, data);

    return {
      ...data,
      id: docId,
    };
  });
}
