import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BEARER_AUTH, COOKIE_AUTH } from 'src/common/swagger/api-docs.decorators';

export const SWAGGER_PATH = 'docs';

const DESCRIPTION = `
API do **FisioConnects (+Physio)**: plataforma que conecta pacientes a fisioterapeutas e oferece aos profissionais
a gestão dos seus pacientes clínicos, prontuários, evoluções de quadro e relatórios em PDF.

## Perfis de usuário
| Perfil | O que pode fazer |
|---|---|
| \`PATIENT\` | Buscar profissionais, avaliar e favoritar profissionais |
| \`PROFESSIONAL\` | Gerenciar pacientes clínicos, prontuários, evoluções e gerar relatórios em PDF |

## Autenticação
1. Cadastre-se em \`POST /patient/register\` ou \`POST /professional/register\`. Um código de verificação (OTP, 6 dígitos, válido por 5 minutos) é enviado por e-mail.
2. Faça o primeiro login em \`POST /auth/login\` informando o campo \`otp\` para verificar a conta.
3. O login devolve o JWT (válido por 3 dias) no cookie **httpOnly** \`access_token\`. Como este Swagger é servido pela própria API,
   o navegador passa a enviar o cookie automaticamente: depois do login, basta chamar as rotas protegidas (🔒).
4. Clientes que não usam cookies podem enviar o mesmo token no header \`Authorization: Bearer <token>\` (botão **Authorize**).

Trocar a senha invalida todas as sessões emitidas antes da troca.

## Identificadores
Os recursos são expostos pelo campo \`publicId\` (string de 21 caracteres gerada com nanoid), nunca pelo \`id\` numérico do banco.

## Limite de requisições
- Global: **120 requisições por minuto** por cliente.
- Rotas de autenticação e cadastro: **5 requisições por minuto**.

Ao exceder o limite, a API responde \`429 Too Many Requests\`.

## Formato dos erros
Todos os erros seguem o padrão do NestJS: \`{ "statusCode": 404, "message": "...", "error": "Not Found" }\`.
Em erros de validação, \`message\` é uma lista com uma mensagem por campo inválido.
Campos não declarados nos DTOs são removidos automaticamente do corpo da requisição.
`;

export function setupSwagger(app: INestApplication) {
    const config = new DocumentBuilder()
        .setTitle('FisioConnects API')
        .setDescription(DESCRIPTION)
        .setVersion(process.env.npm_package_version ?? '0.0.1')
        .addCookieAuth(
            'access_token',
            {
                type: 'apiKey',
                in: 'cookie',
                description: 'Cookie httpOnly definido automaticamente por `POST /auth/login`',
            },
            COOKIE_AUTH,
        )
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Alternativa ao cookie: informe apenas o token, sem o prefixo "Bearer"',
            },
            BEARER_AUTH,
        )
        .addTag('Status', 'Verificação de disponibilidade da API')
        .addTag('Autenticação', 'Login, logout, verificação de conta e redefinição de senha')
        .addTag('Cadastro', 'Criação de contas de pacientes e profissionais')
        .addTag('Usuário', 'Perfil do usuário autenticado e listagem pública de profissionais')
        .addTag('Profissionais', 'Perfil público dos profissionais')
        .addTag('Busca', 'Busca e filtros de profissionais')
        .addTag('Avaliações', 'Avaliações (notas de 1 a 5) feitas por pacientes aos profissionais')
        .addTag('Favoritos', 'Profissionais favoritados pelo paciente autenticado')
        .addTag('Pacientes clínicos', 'Pacientes cadastrados pelo profissional autenticado (uso exclusivo de profissionais)')
        .addTag('Prontuários', 'Prontuários dos pacientes clínicos (uso exclusivo de profissionais)')
        .addTag('Evoluções', 'Evoluções do quadro registradas em cada prontuário (uso exclusivo de profissionais)')
        .addTag('Relatórios', 'Geração de relatórios clínicos em PDF (uso exclusivo de profissionais)')
        .build();

    //As tags são definidas manualmente em cada controller/rota
    const document = SwaggerModule.createDocument(app, config, { autoTagControllers: false });

    SwaggerModule.setup(SWAGGER_PATH, app, document, {
        customSiteTitle: 'FisioConnects API | Documentação',
        jsonDocumentUrl: `${SWAGGER_PATH}/json`,
        swaggerOptions: {
            persistAuthorization: true,
            withCredentials: true,
            docExpansion: 'none',
            filter: true,
            displayRequestDuration: true,
        },
    });
}
