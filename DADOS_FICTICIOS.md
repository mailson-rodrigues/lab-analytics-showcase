# Politica de dados

- Exames sao "Exame Demonstracao A/B/C"; os pedidos recebem protocolo sequencial (PED-0001...).
- Nao ha paciente, medico, e-mail, telefone, CPF/CNPJ ou endereco.
- A semente (`semente`, padrao 42) torna os dados reproduziveis nos testes.
- Um teste automatico recusa e-mail, CPF e telefone nos dados gerados.
