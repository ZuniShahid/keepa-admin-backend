import { Type, Static } from '@sinclair/typebox';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { doc, getDoc, updateDoc } from 'firebase/firestore/lite';
import errors from 'http-errors';

const RequestBodySchema = Type.Strict(
  Type.Object({
    name: Type.String(),
  })
);

const RequestParamsSchema = Type.Strict(
  Type.Object({
    categoryId: Type.String(),
  })
);

const ResponseSchema = Type.Strict(
  Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.String(),
    createdAt: Type.Optional(Type.String()),
    updatedAt: Type.Optional(Type.String()),
  })
);

export type Category = Static<typeof ResponseSchema>;

const schema = {
  params: RequestParamsSchema,
  body: RequestBodySchema,
  response: {
    200: ResponseSchema,
  },
};

export default async function updateItem(fastify: FastifyInstance) {
  fastify.put(
    '/:categoryId',
    { schema },
    async (req: FastifyRequest<{ Params: { categoryId: string }; Body: { name: string } }>): Promise<any> => {
      const documentRef = doc(fastify.firebase, 'categories', req.params.categoryId);

      const docRef = await getDoc(documentRef);
      if (!docRef.exists()) {
        throw new errors.NotFound('Category does not exists');
      }

      const updatedDoc = {
        ...docRef.data(),
        name: req.body.name,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(documentRef, updatedDoc);

      return {
        ...updatedDoc,
        id: docRef.id,
      };
    }
  );
}
