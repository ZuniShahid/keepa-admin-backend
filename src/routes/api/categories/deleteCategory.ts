import { Type, Static } from '@sinclair/typebox';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { doc, getDoc, deleteDoc } from 'firebase/firestore/lite';
import errors from 'http-errors';

const ResponseSchema = Type.Strict(
  Type.Object({
    message: Type.String(),
  })
);

export type Item = Static<typeof ResponseSchema>;

const schema = {
  response: {
    200: ResponseSchema,
  },
};

export default async function updateItem(fastify: FastifyInstance) {
  fastify.delete(
    '/:categoryId',
    { schema },
    async (req: FastifyRequest<{ Params: { categoryId: string } }>): Promise<any> => {
      const documentRef = doc(fastify.firebase, 'categories', req.params.categoryId);

      if (!(await getDoc(documentRef)).exists()) {
        throw new errors.NotFound('Category does not exists');
      }

      await deleteDoc(documentRef);

      return {
        message: 'Delete successful',
      };
    }
  );
}
