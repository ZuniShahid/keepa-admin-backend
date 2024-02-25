import { Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { doc, getDoc } from 'firebase/firestore/lite';
import errors from 'http-errors';

const ResponseSchema = Type.Strict(
  Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.String(),
    createdAt: Type.Optional(Type.String()),
    updatedAt: Type.Optional(Type.String()),
  })
);

const schema = {
  response: {
    200: ResponseSchema,
  },
};

export default async function getCategory(fastify: FastifyInstance) {
  fastify.get(
    '/:categoryId',
    { schema },
    async (req: FastifyRequest<{ Params: { categoryId: string }; Body: { name: string } }>): Promise<any> => {
      const documentRef = doc(fastify.firebase, 'categories', req.params.categoryId);

      const docRef = await getDoc(documentRef);
      if (!docRef.exists()) {
        throw new errors.NotFound('Category does not exists');
      }

      return {
        ...docRef.data(),
        id: docRef.id,
      };
    }
  );
}
