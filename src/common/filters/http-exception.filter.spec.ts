import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const host = {
    switchToHttp: () => ({
      getRequest: () => ({ method: 'POST', url: '/v1/payments' }),
      getResponse: () => response,
    }),
  };

  beforeEach(() => jest.clearAllMocks());

  it('serializes an HTTP exception without losing its public error code', () => {
    new HttpExceptionFilter().catch(
      new HttpException(
        { message: 'Payment is invalid.', code: 'PAYMENT_INVALID' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      ),
      host as never,
    );

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Payment is invalid.',
        code: 'PAYMENT_INVALID',
      }),
    );
  });

  it('does not serialize nested provider causes or database details', () => {
    const nested = new Error('provider query: SELECT private_column');
    nested.cause = { detail: 'database connection string' };

    new HttpExceptionFilter().catch(nested, host as never);

    const body = response.json.mock.calls[0][0];
    expect(body).toMatchObject({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
    expect(JSON.stringify(body)).not.toContain('private_column');
    expect(JSON.stringify(body)).not.toContain('connection string');
  });
});
