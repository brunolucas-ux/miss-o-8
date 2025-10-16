const Airtable = require('airtable');

// Validação forte das variáveis de ambiente
const requiredEnv = ['AIRTABLE_API_KEY', 'AIRTABLE_BASE_ID', 'AIRTABLE_TABLE_NAME'];
const missing = requiredEnv.filter((k) => !process.env[k] || String(process.env[k]).trim() === '');

if (missing.length > 0) {
  const message = `Variáveis de ambiente ausentes: ${missing.join(', ')}.\n` +
    'Crie um arquivo .env baseado em env.example e preencha suas credenciais, ou exporte-as no shell.';
  // Lançar erro claro para impedir inicialização silenciosa
  throw new Error(message);
}

// Instância do Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

// Export da tabela configurada
const airtableTable = base(process.env.AIRTABLE_TABLE_NAME);

module.exports = { airtableTable };


