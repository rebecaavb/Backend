const express = require('express'); //importando o express (conjunto de ferramentas que dão a possibilidade de incluir rotas na aplicação para acessar endereços diferentes e vai gerenciar pra nós)

const cors = require('cors');
//Id único universal
const { v4: uuid_v4, validate } = require('uuid'); //importando parcialmente algo através das {}

const app = express(); //criando aplicação

app.use(cors());

//deve vir ANTES DAS ROTAS
app.use(express.json()); //adicionar algum tipo de função que todas as rotas vão ter que passar por elas

//gerenciando rotas
//parâmetros para acessar rota na URL 
//não necessariamente preciso ouvir um endereço (projects), se colocar apenas /

/** 
 * Métodos HTTP:
 * 
 * GET: Buscar informações do back-end
 * POST: Criar uma informação no back-end
 * PUT/PATCH: Alterar uma informação no back-end (O segundo é utilizado para alterar coisas específicas)
 * DELETE: Deletar uma informação no back-end
 */

/**
 * Tipos de parâmetros:
 * 
 * Query Params: Filtros e paginação -> title=React&owner=Rebeca
 * Route Params: Identificar recursos (Atualizar/Deletar)
 * Request Body: Conteúdo na hora de criar ou editar um recurso (JSON)
 */


/**
 * Middleware:
 * 
 * Interceptador de requisições que pode interromper totalmente a requisição ou alterar dados da requisição.
 */

var projects = [];

function logRequests(request, response, next) {
    const { method, url } = request;

    const logLabel = `[${method.toUpperCase()}] ${url}`;

    console.time(logLabel);

    /**se eu não chamar next para o próximo middleware 
    (que são as requisições, ele NÃO continua executando)*/
    next(); //Próximo middleware

    console.timeEnd(logLabel);
}

function validateProjectId(request, response, next) {
    const { id } = request.params;

    if (!validate(id)) {
        return response.status(400).json({ error: 'Invalid project ID.' });
    }

    return next();
}

app.use(logRequests);
app.use('/projects/:id', validateProjectId); //adicionando middleware de validação somente nos métodos de PUT e DELETE

//GET
//pode colocar quantos middlewares quisermos antes das requisições
app.get('/projects', (request, response) => {
    // const query = request.query;
    // console.log(query);

    // const { title, owner } = request.query;
    // console.log(title);
    // console.log(owner);

    const { title } = request.query;

    const results = title
        ? projects.filter(project => project.title.includes(title))
        : projects;

    return response.json(results);
});

//POST
app.post('/projects', (request, response) => {
    const { title, owner } = request.body;

    //criando id único
    const project = { id: uuid_v4(), title, owner };

    projects.push(project);

    return response.json(project);
});

//PUT
app.put('/projects/:id', (request, response) => {
    //const params = request.params;
    // console.log(params);

    //acessando id da URL
    const { id } = request.params;
    //acessando body da requisição
    const { title, owner } = request.body;

    //procurando projeto dentro da lista de projetos com o id vindo da URL
    const projectIndex = projects.findIndex(project => project.id == id);

    //se não encontrou o id, retorna mensagem de erro
    if (projectIndex < 0) {
        return response.status(400).json({ error: 'Project not found.' });
    }

    //criando um novo projeto pra substituir o antigo
    const project = {
        id,
        title,
        owner,
    };

    //substituindo projeto na lista
    projects[projectIndex] = project;

    return response.json(project);
});

//DELETE
app.delete('/projects/:id', (request, response) => {
    const { id } = request.params;

    const projectIndex = projects.findIndex(project => project.id == id);

    if (projectIndex < 0) {
        return response.status(400).json({ error: 'Project not found.' });
    }

    //remover algum dado de dentro do array
    projects.splice(projectIndex, 1); //-> quantas posições eu quero remover a partir desse índice

    return response.status(204).send();
});

//DELETE ALL
app.delete('/projects', (request, response) => {
    projects = [];
    return response.status(204).send();
});

//precisamos ouvir uma porta
//precisamos escolher uma porta acima da porta 80
//segundo parâmetro será uma função disparada assim que o servidor conseguir ser instalado (quando conseguir subir o servidor)
app.listen(3000, () => {
    console.log('🚀 Back-end started!');
});