import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { isUndefined } from '@sniptt/guards';
import {
  FieldMetadataType,
  RelationDefinitionType,
} from '~/generated-metadata/graphql';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordGqlFields } from '@/object-record/graphql/types/RecordGqlFields';
import { isNonCompositeField } from '@/object-record/object-filter-dropdown/utils/isNonCompositeField';
import { FieldMetadataItem } from '../types/FieldMetadataItem';

type MapFieldMetadataToGraphQLQueryArgs = {
  objectMetadataItems: ObjectMetadataItem[];
  field: Pick<FieldMetadataItem, 'name' | 'type' | 'relationDefinition'>;
  relationRecordGqlFields?: RecordGqlFields;
  computeReferences?: boolean;
};
// TODO: change ObjectMetadataItems mock before refactoring with relationDefinition computed field
export const mapFieldMetadataToGraphQLQuery = ({
  objectMetadataItems,
  field,
  relationRecordGqlFields,
  computeReferences = false,
}: MapFieldMetadataToGraphQLQueryArgs): string => {
  const fieldType = field.type;

  const fieldIsNonCompositeField = isNonCompositeField(fieldType);

  if (fieldIsNonCompositeField) {
    return field.name;
  }

  if (
    fieldType === FieldMetadataType.RELATION &&
    field.relationDefinition?.direction === RelationDefinitionType.MANY_TO_ONE
  ) {
    const relationMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id ===
        field.relationDefinition?.targetObjectMetadata.id,
    );

    if (isUndefined(relationMetadataItem)) {
      return '';
    }

    return `${field.name}
${mapObjectMetadataToGraphQLQuery({
  objectMetadataItems,
  objectMetadataItem: relationMetadataItem,
  recordGqlFields: relationRecordGqlFields,
  computeReferences: computeReferences,
  isRootLevel: false,
})}`;
  }

  if (
    fieldType === FieldMetadataType.RELATION &&
    field.relationDefinition?.direction === RelationDefinitionType.ONE_TO_MANY
  ) {
    const relationMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id ===
        field.relationDefinition?.targetObjectMetadata.id,
    );

    if (isUndefined(relationMetadataItem)) {
      return '';
    }

    return `${field.name}
{
  edges {
    node ${mapObjectMetadataToGraphQLQuery({
      objectMetadataItems,
      objectMetadataItem: relationMetadataItem,
      recordGqlFields: relationRecordGqlFields,
      computeReferences,
      isRootLevel: false,
    })}
  }
}`;
  }

  if (fieldType === FieldMetadataType.LINKS) {
    return `${field.name}
{
  primaryLinkUrl
  primaryLinkLabel
  secondaryLinks
}`;
  }

  if (fieldType === FieldMetadataType.CURRENCY) {
    return `${field.name}
{
  amountMicros
  currencyCode
}
    `;
  }

  if (fieldType === FieldMetadataType.FULL_NAME) {
    return `${field.name}
{
  firstName
  lastName
}`;
  }

  if (fieldType === FieldMetadataType.ADDRESS) {
    return `${field.name}
{
  addressStreet1
  addressStreet2
  addressCity
  addressState
  addressCountry
  addressPostcode
  addressLat
  addressLng
}`;
  }

  if (fieldType === FieldMetadataType.ACTOR) {
    return `${field.name}
{
    source
    workspaceMemberId
    name
    context
}`;
  }

  if (fieldType === FieldMetadataType.EMAILS) {
    return `${field.name}
{
  primaryEmail
  additionalEmails
}`;
  }

  if (fieldType === FieldMetadataType.PHONES) {
    return `${field.name}
    {
      primaryPhoneNumber
      primaryPhoneCountryCode
      primaryPhoneCallingCode
      additionalPhones
    }`;
  }

  if (fieldType === FieldMetadataType.RICH_TEXT_V2) {
    return `${field.name}
{
  blocknote
  markdown
}`;
  }

  return '';
};
