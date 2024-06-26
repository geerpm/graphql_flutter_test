import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { createHash } from 'crypto';

/// $ npm install 
/// $ node server.mjs

const typeDefs = `#graphql
type Author {
    id: ID!
    name: String!
}

type Article {
    id: ID!
    content: String!
    author: Author!
    createdAt: String!
    modifiedAt: String!
}

type ArticleList {
    articles: [Article!]!
    totalCount: Int!
}

type Mutation {
    createArticle(content: String!, authorName: String!): Article!
    updateArticle(id: ID!, content: String!, authorName: String!): Article!
    deleteArticle(id: ID!): Article!
}

type Query {
    articles: ArticleList!
    article(id: ID!): Article!
}
`;

let articles = [];

function findArticle(id) {
  const article = articles.find((a) => a.id === id);
  if (!article) {
    throw new Error('Article not found');
  }
  return article;
};

function _hash(value) {
  return createHash('md5').update(`${value}`).digest('hex');
}


const resolvers = {
  Query: {
    articles: () => ({ articles: [...articles], totalCount: articles.length }),
    article: (_, {id}) => findArticle(id),
  },
  Mutation: {
    createArticle(_, { content, authorName }) {
        const newArticle = {
            id: `${Date.now()}`,
            content,
            author: {
                id: `${_hash(authorName)}`,
                name: authorName,
            },
            createdAt: `${Date.now()}`,
            modifiedAt: `${Date.now()}`,
        };
        articles.push(newArticle);
        return newArticle;
    },
    updateArticle(_, {id, content, authorName}){
        const article = findArticle(id);
        const updatedArticles = {
            ...article,
            content: content,
            author: {
                id: `${_hash(authorName)}`,
                name: `${authorName}`,
            },
            modifiedAt: `${Date.now()}`,
        };
        const idx = articles.findIndex((a) => a.id === id);
        articles[idx] = updatedArticles;
        return updatedArticles;
    },
    deleteArticle(_, {id}) {
        const article = findArticle(id);
        articles = articles.filter((a) => a.id !== id);
        return article;
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server);
console.log(`🚀 Server ready at ${url}`);
