// Configuração de testes
require('dotenv').config({ path: '.env.test' });

// Mock do AirTable para testes
jest.mock('airtable', () => {
  const mockRecords = new Map();
  let nextId = 1;

  return jest.fn(() => ({
    base: jest.fn(() => ({
      select: jest.fn(() => ({
        all: jest.fn(() => Promise.resolve(Array.from(mockRecords.values())))
      })),
      find: jest.fn((id) => {
        const record = mockRecords.get(id);
        if (!record) {
          const error = new Error('Not found');
          error.statusCode = 404;
          throw error;
        }
        return Promise.resolve(record);
      }),
      create: jest.fn((data) => {
        const id = `rec${nextId++}`;
        const record = {
          id,
          fields: {
            ...data,
            DataCriacao: new Date().toISOString(),
            DataAtualizacao: new Date().toISOString()
          }
        };
        mockRecords.set(id, record);
        return Promise.resolve(record);
      }),
      update: jest.fn((id, data) => {
        const record = mockRecords.get(id);
        if (!record) {
          const error = new Error('Not found');
          error.statusCode = 404;
          throw error;
        }
        record.fields = { ...record.fields, ...data };
        return Promise.resolve(record);
      }),
      destroy: jest.fn((id) => {
        if (!mockRecords.has(id)) {
          const error = new Error('Not found');
          error.statusCode = 404;
          throw error;
        }
        mockRecords.delete(id);
        return Promise.resolve();
      })
    }))
  }));
});

// Configurações globais de teste
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};
