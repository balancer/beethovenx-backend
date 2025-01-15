import { Resolvers } from '../generated-schema';
import { GraphQLScalarType, Kind } from 'graphql';

const dateScalar = new GraphQLScalarType<Date | null, string | null>({
    name: 'Date',
    description: 'Date custom scalar type',
    serialize(value) {
        if (value instanceof Date) {
            return value.toISOString(); // Convert outgoing Date to integer for JSON
        }
        return null;
    },
    parseValue(value) {
        if (typeof value === 'string') {
            return new Date(value); // Convert incoming integer to Date
        }
        return null;
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.STRING) {
            return new Date(ast.value); // Convert hard-coded AST string to integer and then to Date
        }
        return null; // Invalid hard-coded value (not an integer)
    },
});

const dateResolver: Resolvers = {
    Date: dateScalar,
};

export default dateResolver;
