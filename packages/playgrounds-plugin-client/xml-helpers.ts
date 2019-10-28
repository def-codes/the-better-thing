import { encoder } from "./string-helpers";

const TEXT_ENTITIES = { "&": "amp", "<": "lt", ">": "gt" };
const ATTRIBUTE_ENTITIES = { "'": "apos", '"': "quot" };

const as_entity = name => `&${name};`;

const entity_encoder = dictionary => encoder(dictionary, as_entity);

export const encode_text = entity_encoder(TEXT_ENTITIES);
export const encode_attribute_value = entity_encoder(ATTRIBUTE_ENTITIES);
