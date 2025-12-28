import requests
import json
import uuid
import re
import time
import random
from typing import Optional, Tuple
from datetime import datetime
from pinecone import Pinecone
import os
import csv
from dotenv import load_dotenv

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Ensure Pinecone index exists
index_name = "truila-houses"
EMBED_MODEL = "llama-text-embed-v2"
if not pc.has_index(index_name):
    pc.create_index_for_model(
        name=index_name,
        cloud="aws",
        region="us-east-1",
        embed={
            "model": EMBED_MODEL,
            "field_map": {"text": "chunk_text"},
        },
    )

# Use index host (recommended by Pinecone docs)
index_host = pc.describe_index(index_name).host
index = pc.Index(host=index_host)
namespace = "properties"

# Base URL - no query params needed, they're in the payload
url = "https://www.trulia.com/graphql"

# Parse the payload string to a dictionary
LIMIT = 500
payload_str = '{"operationName":"WEB_searchHomesByUrl","variables":{"limit":40,"shouldIncludeSrpFragment":true,"shouldIncludeHeaderAndFooterFragment":false,"defaultSortType":null,"defaultSortDirection":null,"includeNearBy":false,"isNearbyCitiesEnabled":false,"isInSeoLongTermRentalTitleTest":false,"inFooterTest":false,"inCrossSellTest":false,"includeReviewHighlights":false,"locationNameFormat":"SHORT_TEXT","heroImageFallbacks":["STREET_VIEW","SATELLITE_VIEW"],"url":"/for_rent/Charlotte,NC/","isBot":false},"query":"query WEB_searchHomesByUrl($url: String!, $limit: Int = 40, $heroImageFallbacks: [MEDIA_HeroImageFallbackTypes!], $isBot: Boolean!, $shouldIncludeSrpFragment: Boolean = true, $shouldIncludeHeaderAndFooterFragment: Boolean = true, $defaultSortType: SEARCHDETAILS_SortType = null, $defaultSortDirection: SEARCHDETAILS_SortDirection = null, $includeNearBy: Boolean = false, $isNearbyCitiesEnabled: Boolean = false, $isInSeoLongTermRentalTitleTest: Boolean = false, $inFooterTest: Boolean = false, $inCrossSellTest: Boolean = false, $crossSellVariation: SEARCH_CrossSellModuleVariation, $includeReviewHighlights: Boolean = false, $locationNameFormat: SEARCH_NamesFormat = null) {\\n  searchHomesByUrl(\\n    url: $url\\n    limit: $limit\\n    defaultSortType: $defaultSortType\\n    defaultSortDirection: $defaultSortDirection\\n    includeNearBy: $includeNearBy\\n  ) {\\n    ...SearchResultsContentFragment @include(if: $shouldIncludeSrpFragment)\\n    ...HeaderAndFooterFragment @include(if: $shouldIncludeHeaderAndFooterFragment)\\n    ...SearchResultsBranchBannerFragmnet @include(if: $shouldIncludeSrpFragment)\\n    __typename\\n  }\\n}\\n\\nfragment SearchResultsContentFragment on SEARCH_Result {\\n  currentUrl\\n  canonicalUrl\\n  secondaryNavigation(inFooterTest: $inFooterTest) {\\n    inFooterTest\\n    __typename\\n  }\\n  adTargetings @skip(if: $isBot)\\n  ...SearchResultHeaderLocationFragment\\n  ...SearchResultsMarketDetailsFragment @include(if: $isBot)\\n  ...SearchResultsMarketDetailsFragment @include(if: $inFooterTest)\\n  ...SearchResultsHomesListFragment\\n  ...SearchResultsPaginationFragment\\n  ...SearchResultsBreadcrumbsFragment\\n  ...SearchResultsPopularLocationsFragment\\n  ...SearchResultsMapFragment\\n  ...SearchResultsFooterCardFragment\\n  ...SearchResultsFiltersFragment\\n  ...SearchResultsProviderAttributionFragment\\n  ...SearchResultsRentalJsonLdSchemaFragment\\n  homes {\\n    ...SearchResultsRentalResultJsonLdSchemaFragment\\n    ...HiddenHomeSrpFragment\\n    __typename\\n  }\\n  details {\\n    ...SearchDetailsFragment\\n    canonicalUrl\\n    __typename\\n  }\\n  names(isInSeoLongTermRentalTitleTest: $isInSeoLongTermRentalTitleTest) {\\n    title\\n    locationName\\n    simpleLocationName: locationName(formatType: $locationNameFormat)\\n    description\\n    __typename\\n  }\\n  tracking {\\n    key\\n    value\\n    __typename\\n  }\\n  pageDisplayFlags {\\n    isAdvertisingRestricted\\n    __typename\\n  }\\n  nearByHomes {\\n    ...HomeDetailsCardFragment\\n    ...HomeDetailsCardPhotosFragment\\n    ...SingleFamilyResidenceJsonLdFragment\\n    ...OpenHouseJsonLdFragment\\n    ...HomeDetailsCallToActionFragment\\n    ...HiddenHomeSrpFragment\\n    __typename\\n  }\\n  openHomes {\\n    inPerson {\\n      ...OpenHouseJsonLdFragment\\n      __typename\\n    }\\n    __typename\\n  }\\n  dynamicFilters {\\n    homeTypes {\\n      name\\n      searchUrl\\n      __typename\\n    }\\n    listingTypes {\\n      name\\n      searchUrl\\n      __typename\\n    }\\n    __typename\\n  }\\n  location {\\n    encodedPolygon\\n    __typename\\n  }\\n  isSrpIndexable\\n  preferences {\\n    isSaved @skip(if: $isBot)\\n    __typename\\n  }\\n  ...CrossSellModuleFragment @include(if: $inCrossSellTest)\\n  ...ExploreCollectionsFragmentBot @include(if: $isBot)\\n  __typename\\n}\\n\\nfragment SearchResultHeaderLocationFragment on SEARCH_Result {\\n  location {\\n    ... on SEARCH_ResultLocationState {\\n      state\\n      __typename\\n    }\\n    ... on SEARCH_ResultLocationBoundingBox {\\n      city\\n      state\\n      __typename\\n    }\\n    ... on SEARCH_ResultLocationCity {\\n      city\\n      state\\n      __typename\\n    }\\n    ... on SEARCH_ResultLocationCounty {\\n      county\\n      state\\n      __typename\\n    }\\n    ... on SEARCH_ResultLocationNeighborhood {\\n      city\\n      state\\n      neighborhood\\n      __typename\\n    }\\n    ... on SEARCH_ResultLocationPostalCode {\\n      city\\n      state\\n      postalCode\\n      __typename\\n    }\\n    ... on SEARCH_ResultLocationSchool {\\n      name\\n      __typename\\n    }\\n    ... on SEARCH_ResultLocationSchoolDistrict {\\n      city\\n      state\\n      schoolDistrictIds\\n      __typename\\n    }\\n    ... on SEARCH_ResultLocationCommute {\\n      exactCoordinates {\\n        latitude\\n        longitude\\n        __typename\\n      }\\n      __typename\\n    }\\n    ... on SEARCH_ResultLocationUniversity {\\n      city\\n      state\\n      name\\n      __typename\\n    }\\n    __typename\\n  }\\n  recentSearches {\\n    title\\n    type\\n    url\\n    locationDetails {\\n      cities {\\n        city\\n        state\\n        __typename\\n      }\\n      counties\\n      neighborhoods\\n      zips\\n      schoolDistricts\\n      school {\\n        id\\n        name\\n        __typename\\n      }\\n      commute {\\n        type\\n        __typename\\n      }\\n      __typename\\n    }\\n    formattedFilterLists\\n    __typename\\n  }\\n  pageDisplayFlags {\\n    shouldDisplayZINCAttribution\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment SearchResultsHomesListFragment on SEARCH_Result {\\n  homeCounts {\\n    agentListingsCount {\\n      value\\n      __typename\\n    }\\n    otherListingsCount {\\n      value\\n      __typename\\n    }\\n    resultCount {\\n      formattedValue\\n      __typename\\n    }\\n    __typename\\n  }\\n  homes {\\n    ...HomeDetailsCardFragment\\n    ...HomeDetailsCardPhotosFragment\\n    ...SingleFamilyResidenceJsonLdFragment\\n    ...OpenHouseJsonLdFragment\\n    ...HomeDetailsCallToActionFragment\\n    ...SearchResultsProductJsonLdFragment\\n    __typename\\n  }\\n  ...FailedSearchFragment\\n  names(isInSeoLongTermRentalTitleTest: $isInSeoLongTermRentalTitleTest) {\\n    headerTag\\n    subHeaderTag\\n    secondaryHeaderTag\\n    resultsIncludeDescription\\n    searchResultsMapTag\\n    nearByHeaderTag\\n    nearBySubHeaderTag\\n    formattedFilterLists\\n    __typename\\n  }\\n  totalHomes\\n  details {\\n    ...SearchResultsSortFragment\\n    __typename\\n  }\\n  emptyState {\\n    noHomesFoundText\\n    noHomesFoundCTAText\\n    reason\\n    __typename\\n  }\\n  moreHomesInformation {\\n    title\\n    body\\n    ctaTitle\\n    __typename\\n  }\\n  dynamicFilters {\\n    neighborhoods {\\n      value\\n      displayText\\n      isActive\\n      count\\n      __typename\\n    }\\n    neighborhoodRegions {\\n      value\\n      displayText\\n      isActive\\n      count\\n      __typename\\n    }\\n    __typename\\n  }\\n  isSaveSearchCardVisible\\n  availableExploreCollections\\n  isResultsCommingled\\n  ...SearchResultsPopularLocationCarouselsFragment\\n  __typename\\n}\\n\\nfragment HomeDetailsCardFragment on HOME_Details {\\n  __typename\\n  location {\\n    city\\n    stateCode\\n    zipCode\\n    streetAddress\\n    fullLocation: formattedLocation(formatType: STREET_CITY_STATE_ZIP)\\n    partialLocation: formattedLocation(formatType: STREET_ONLY)\\n    __typename\\n  }\\n  price {\\n    formattedPrice\\n    ... on HOME_ValuationPrice {\\n      typeDescription(abbreviate: true)\\n      __typename\\n    }\\n    ... on HOME_SinglePrice {\\n      typeDescription\\n      typeDescriptionIcon\\n      typeDescriptionDetails {\\n        markdown\\n        __typename\\n      }\\n      __typename\\n    }\\n    ... on HOME_PriceRange {\\n      typeDescription\\n      typeDescriptionIcon\\n      typeDescriptionDetails {\\n        markdown\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n  url\\n  homeUrl\\n  tags(include: MINIMAL) {\\n    level\\n    formattedName\\n    icon {\\n      vectorImage {\\n        svg\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n  fullTags: tags {\\n    level\\n    formattedName\\n    icon {\\n      vectorImage {\\n        svg\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n  floorSpace {\\n    formattedDimension\\n    __typename\\n  }\\n  lotSize {\\n    ... on HOME_SingleDimension {\\n      formattedDimension(minDecimalDigits: 2, maxDecimalDigits: 2)\\n      __typename\\n    }\\n    __typename\\n  }\\n  bedrooms {\\n    formattedValue(formatType: COMMON_ABBREVIATION)\\n    ... on HOME_BedroomRange {\\n      min\\n      max\\n      __typename\\n    }\\n    ... on HOME_FixedBedrooms {\\n      value\\n      __typename\\n    }\\n    __typename\\n  }\\n  bathrooms {\\n    formattedValue(formatType: COMMON_ABBREVIATION)\\n    ... on HOME_FixedBathrooms {\\n      value\\n      __typename\\n    }\\n    ... on HOME_BathroomRange {\\n      max\\n      min\\n      __typename\\n    }\\n    __typename\\n  }\\n  isSaveable\\n  preferences {\\n    isSaved\\n    __typename\\n  }\\n  metadata {\\n    compositeId\\n    legacyIdForSave\\n    unifiedListingType\\n    typedHomeId\\n    __typename\\n  }\\n  typedHomeId\\n  tracking {\\n    key\\n    value\\n    __typename\\n  }\\n  displayFlags {\\n    showMLSLogoOnListingCard\\n    addAttributionProminenceOnListCard\\n    __typename\\n  }\\n  ... on HOME_RoomForRent {\\n    providerListingId\\n    __typename\\n  }\\n  ... on HOME_RentalCommunity {\\n    activeListing {\\n      provider {\\n        summary(formatType: SHORT)\\n        listingSource {\\n          logoUrl\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    location {\\n      communityLocation: formattedLocation(formatType: STREET_COMMUNITY_NAME)\\n      __typename\\n    }\\n    providerListingId\\n    __typename\\n  }\\n  ... on HOME_Property {\\n    currentStatus {\\n      isRecentlySold\\n      isRecentlyRented\\n      isActiveForRent\\n      isActiveForSale\\n      isOffMarket\\n      isForeclosure\\n      __typename\\n    }\\n    priceChange {\\n      priceChangeDirection\\n      __typename\\n    }\\n    activeListing {\\n      provider {\\n        summary(formatType: SHORT)\\n        extraShortSummary: summary(formatType: EXTRA_SHORT)\\n        listingSource {\\n          logoUrl\\n          __typename\\n        }\\n        __typename\\n      }\\n      dateListed\\n      __typename\\n    }\\n    lastSold {\\n      provider {\\n        summary(formatType: SHORT)\\n        extraShortSummary: summary(formatType: EXTRA_SHORT)\\n        listingSource {\\n          logoUrl\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    providerListingId\\n    __typename\\n  }\\n  ... on HOME_FloorPlan {\\n    priceChange {\\n      priceChangeDirection\\n      __typename\\n    }\\n    provider {\\n      summary(formatType: SHORT)\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment HomeDetailsCardPhotosFragment on HOME_Details {\\n  media {\\n    __typename\\n    heroImage(fallbacks: $heroImageFallbacks) {\\n      url {\\n        small\\n        medium\\n        __typename\\n      }\\n      webpUrl: url(compression: webp) {\\n        small\\n        medium\\n        __typename\\n      }\\n      __typename\\n    }\\n    photos {\\n      url {\\n        small\\n        medium\\n        __typename\\n      }\\n      webpUrl: url(compression: webp) {\\n        small\\n        medium\\n        __typename\\n      }\\n      __typename\\n    }\\n  }\\n  __typename\\n}\\n\\nfragment HomeDetailsCallToActionFragment on HOME_Details {\\n  hasPrequalifiers\\n  ... on HOME_Property {\\n    isTourAvailable(isOptimistic: true)\\n    __typename\\n  }\\n  leadFormCallToAction(context: CARD, appendOneClick: true) {\\n    callToActionType\\n    callToActionDisplayLabel\\n    supportsCancellableSubmission\\n    buttonStyle\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment FailedSearchFragment on SEARCH_Result {\\n  names(isInSeoLongTermRentalTitleTest: $isInSeoLongTermRentalTitleTest) {\\n    locationName\\n    __typename\\n  }\\n  location {\\n    __typename\\n    ... on SEARCH_ResultLocationPointOfInterest {\\n      exactCoordinates {\\n        latitude\\n        longitude\\n        __typename\\n      }\\n      __typename\\n    }\\n  }\\n  __typename\\n}\\n\\nfragment SearchResultsSortFragment on SEARCHDETAILS_Details {\\n  filters {\\n    sort {\\n      type\\n      ascending\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment SingleFamilyResidenceJsonLdFragment on HOME_Property {\\n  location {\\n    partialLocation: formattedLocation(formatType: STREET_ONLY)\\n    city\\n    stateCode\\n    zipCode\\n    coordinates {\\n      latitude\\n      longitude\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment OpenHouseDateFragment on HOME_Listing {\\n  openHouses {\\n    ... on HOME_ScheduledOpenHouse {\\n      start\\n      end\\n      startHour: formattedStartTime(format: \\"hA\\")\\n      endHour: formattedEndTime(format: \\"hA\\")\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment OpenHouseJsonLdFragment on HOME_Details {\\n  ... on HOME_Property {\\n    url\\n    location {\\n      formattedLocation\\n      partialLocation: formattedLocation(formatType: STREET_ONLY)\\n      city\\n      stateCode\\n      zipCode\\n      coordinates {\\n        latitude\\n        longitude\\n        __typename\\n      }\\n      __typename\\n    }\\n    activeForSaleListing {\\n      ...OpenHouseDateFragment\\n      __typename\\n    }\\n    activeForRentListing {\\n      ...OpenHouseDateFragment\\n      __typename\\n    }\\n    media {\\n      hasThreeDHome\\n      hasVideo\\n      photos {\\n        url {\\n          large\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    price {\\n      ... on HOME_SinglePrice {\\n        price\\n        currencyCode\\n        __typename\\n      }\\n      __typename\\n    }\\n    ...VirtualTourJsonLdSchemaFragment\\n    __typename\\n  }\\n  ... on HOME_RoomForRent {\\n    activeForRentListing {\\n      ...OpenHouseDateFragment\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment VirtualTourJsonLdSchemaFragment on HOME_Details {\\n  price {\\n    ... on HOME_SinglePrice {\\n      price\\n      __typename\\n    }\\n    ... on HOME_ValuationPrice {\\n      price\\n      __typename\\n    }\\n    ... on HOME_ListingSinglePrice {\\n      price\\n      __typename\\n    }\\n    __typename\\n  }\\n  ... on HOME_Property {\\n    activeListing {\\n      provider {\\n        listingAgent {\\n          name\\n          __typename\\n        }\\n        broker {\\n          name\\n          __typename\\n        }\\n        builder {\\n          name\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment SearchResultsPopularLocationCarouselsFragment on SEARCH_Result {\\n  surroundingPopularLocations {\\n    exploreCollections {\\n      searches {\\n        title\\n        ctaText\\n        searchUrl\\n        homes {\\n          ...HomeDetailsCardFragment\\n          ...HomeDetailsCardPhotosFragment\\n          ...SingleFamilyResidenceJsonLdFragment\\n          ...OpenHouseJsonLdFragment\\n          ...HomeDetailsCallToActionFragment\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment SearchResultsProductJsonLdFragment on HOME_Details {\\n  ...BaseHomeDetailsProductJsonLdFragment\\n  __typename\\n}\\n\\nfragment BaseHomeDetailsProductJsonLdFragment on HOME_Details {\\n  price {\\n    __typename\\n    ... on HOME_SinglePrice {\\n      price\\n      currencyCode\\n      __typename\\n    }\\n    ... on HOME_PriceRange {\\n      min\\n      max\\n      currencyCode\\n      __typename\\n    }\\n  }\\n  description {\\n    value\\n    __typename\\n  }\\n  media {\\n    photos {\\n      url {\\n        large\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n  location {\\n    jsonLdSchemaFullLocation: formattedLocation\\n    __typename\\n  }\\n  features {\\n    highlightedInfoAttributes {\\n      attribute {\\n        formattedName\\n        formattedValue\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment CrossSellModuleFragment on SEARCH_Result {\\n  crossSellModule(variation: $crossSellVariation) {\\n    heading\\n    description\\n    ctaText\\n    ctaURL\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment SearchResultsPaginationFragment on SEARCH_Result {\\n  totalHomes\\n  currentUrl\\n  details {\\n    filters {\\n      page\\n      limit\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment SearchResultsBreadcrumbsFragment on SEARCH_Result {\\n  navigation {\\n    label\\n    url\\n    linkType\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment SearchResultsRentalJsonLdSchemaFragment on SEARCH_Result {\\n  details {\\n    searchType\\n    __typename\\n  }\\n  location {\\n    ... on SEARCH_ResultLocationCity {\\n      city\\n      state\\n      __typename\\n    }\\n    ... on SEARCH_ResultLocationState {\\n      state\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment SearchResultsRentalResultJsonLdSchemaFragment on HOME_Property {\\n  location {\\n    city\\n    stateCode\\n    formattedLocation\\n    zipCode\\n    coordinates {\\n      latitude\\n      longitude\\n      __typename\\n    }\\n    __typename\\n  }\\n  propertyType {\\n    value\\n    __typename\\n  }\\n  currentStatus {\\n    isActiveForRent\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment SearchResultsPopularLocationsFragment on SEARCH_Result {\\n  surroundingPopularLocations {\\n    forRent {\\n      label\\n      url\\n      stats {\\n        label\\n        formattedValue\\n        __typename\\n      }\\n      __typename\\n    }\\n    forSale {\\n      label\\n      url\\n      stats {\\n        label\\n        formattedValue\\n        __typename\\n      }\\n      __typename\\n    }\\n    sold {\\n      label\\n      url\\n      stats {\\n        label\\n        formattedValue\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment SearchResultsMapFragment on SEARCH_Result {\\n  mapEmptyState: emptyState(format: SHORT) {\\n    noHomesFoundText\\n    __typename\\n  }\\n  details {\\n    filters {\\n      zoom\\n      __typename\\n    }\\n    __typename\\n  }\\n  names(isInSeoLongTermRentalTitleTest: $isInSeoLongTermRentalTitleTest) {\\n    searchResultsMapTag\\n    __typename\\n  }\\n  location {\\n    boundingBox {\\n      minCoordinates {\\n        latitude\\n        longitude\\n        __typename\\n      }\\n      maxCoordinates {\\n        latitude\\n        longitude\\n        __typename\\n      }\\n      __typename\\n    }\\n    ... on SEARCH_ResultLocationCity {\\n      locationId\\n      __typename\\n    }\\n    ... on SEARCH_ResultLocationCounty {\\n      locationId\\n      __typename\\n    }\\n    ... on SEARCH_ResultLocationNeighborhood {\\n      locationId\\n      __typename\\n    }\\n    ... on SEARCH_ResultLocationPostalCode {\\n      locationId\\n      __typename\\n    }\\n    ... on SEARCH_ResultLocationState {\\n      locationId\\n      __typename\\n    }\\n    __typename\\n  }\\n  ...HomeMarkerLayersContainerFragment\\n  ...HoverCardLayerFragment\\n  __typename\\n}\\n\\nfragment HomeMarkerLayersContainerFragment on SEARCH_Result {\\n  ...HomeMarkersLayerFragment\\n  __typename\\n}\\n\\nfragment HomeMarkersLayerFragment on SEARCH_Result {\\n  homes {\\n    location {\\n      coordinates {\\n        latitude\\n        longitude\\n        __typename\\n      }\\n      __typename\\n    }\\n    url\\n    metadata {\\n      compositeId\\n      __typename\\n    }\\n    ...HomeMarkerFragment\\n    __typename\\n  }\\n  nearByHomes {\\n    ...HomeMarkerFragment\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment HomeMarkerFragment on HOME_Details {\\n  media {\\n    hasThreeDHome\\n    __typename\\n  }\\n  location {\\n    coordinates {\\n      latitude\\n      longitude\\n      __typename\\n    }\\n    __typename\\n  }\\n  displayFlags {\\n    enableMapPin\\n    __typename\\n  }\\n  price {\\n    calloutMarkerPrice: formattedPrice(formatType: SHORT_ABBREVIATION)\\n    ... on HOME_SinglePrice {\\n      typeDescription\\n      typeDescriptionIcon\\n      typeDescriptionDetails {\\n        markdown\\n        text\\n        __typename\\n      }\\n      __typename\\n    }\\n    ... on HOME_PriceRange {\\n      typeDescription\\n      typeDescriptionIcon\\n      typeDescriptionDetails {\\n        markdown\\n        text\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n  url\\n  ... on HOME_Property {\\n    activeForSaleListing {\\n      openHouses {\\n        formattedDay\\n        __typename\\n      }\\n      __typename\\n    }\\n    hideMapMarkerAtZoomLevel {\\n      zoomLevel\\n      hide\\n      __typename\\n    }\\n    __typename\\n  }\\n  ... on HOME_RentalCommunity {\\n    hideMapMarkerAtZoomLevel {\\n      zoomLevel\\n      hide\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment HoverCardLayerFragment on SEARCH_Result {\\n  homes {\\n    ...HomeHoverCardFragment\\n    __typename\\n  }\\n  nearByHomes {\\n    ...HomeHoverCardFragment\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment HomeHoverCardFragment on HOME_Details {\\n  ...HomeDetailsCardFragment\\n  ...HomeDetailsCardHeroFragment\\n  ...HomeDetailsCardPhotosFragment\\n  location {\\n    coordinates {\\n      latitude\\n      longitude\\n      __typename\\n    }\\n    __typename\\n  }\\n  displayFlags {\\n    enableMapPin\\n    showMLSLogoOnMapMarkerCard\\n    __typename\\n  }\\n  preferences {\\n    isHomePreviouslyViewed\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment HomeDetailsCardHeroFragment on HOME_Details {\\n  media {\\n    heroImage(fallbacks: $heroImageFallbacks) {\\n      url {\\n        small\\n        medium\\n        __typename\\n      }\\n      webpUrl: url(compression: webp) {\\n        small\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment SearchResultsFiltersFragment on SEARCH_Result {\\n  transitSystems {\\n    name\\n    iconUrl(format: SVG)\\n    isSelected\\n    filterLabel\\n    __typename\\n  }\\n  homeCounts {\\n    agentListingsCount {\\n      formattedValue\\n      __typename\\n    }\\n    otherListingsCount {\\n      formattedValue\\n      __typename\\n    }\\n    resultCount {\\n      formattedValue\\n      __typename\\n    }\\n    __typename\\n  }\\n  dynamicFilters {\\n    homeTypes {\\n      name\\n      searchUrl\\n      __typename\\n    }\\n    listingTypes {\\n      name\\n      searchUrl\\n      __typename\\n    }\\n    amenities {\\n      name\\n      searchUrl\\n      __typename\\n    }\\n    __typename\\n  }\\n  details {\\n    searchType\\n    ...SearchResultsSortFragment\\n    filters {\\n      isAlternateListingSource\\n      price {\\n        min\\n        max\\n        __typename\\n      }\\n      bedrooms {\\n        min\\n        max\\n        __typename\\n      }\\n      bathrooms {\\n        min\\n        max\\n        __typename\\n      }\\n      squareFeet {\\n        min\\n        max\\n        __typename\\n      }\\n      hoaFee {\\n        min\\n        max\\n        __typename\\n      }\\n      propertyTypes\\n      lotSize {\\n        min\\n        max\\n        __typename\\n      }\\n      mlsId\\n      newListing {\\n        range {\\n          min\\n          max\\n          timestamp\\n          __typename\\n        }\\n        daysAgo\\n        __typename\\n      }\\n      recentlyReduced {\\n        range {\\n          min\\n          max\\n          timestamp\\n          __typename\\n        }\\n        daysAgo\\n        __typename\\n      }\\n      openHomes {\\n        range {\\n          min\\n          max\\n          timestamp\\n          __typename\\n        }\\n        type\\n        __typename\\n      }\\n      yearBuilt {\\n        min\\n        max\\n        __typename\\n      }\\n      keywords\\n      listingTypes\\n      plus55Communities {\\n        exclude\\n        __typename\\n      }\\n      airConditioning {\\n        has\\n        __typename\\n      }\\n      soldWithin\\n      pets\\n      furnished\\n      rentalListingTags\\n      isInverseSearch\\n      moveInDate\\n      applicationAndLease\\n      withParking\\n      withDisabledAccess\\n      __typename\\n    }\\n    __typename\\n  }\\n  isResultsCommingled\\n  __typename\\n}\\n\\nfragment SearchResultsProviderAttributionFragment on SEARCH_Result {\\n  providers {\\n    listingSource {\\n      logoUrl\\n      attribution\\n      alternativeSources {\\n        name\\n        url\\n        __typename\\n      }\\n      disclaimer {\\n        markdown\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment SearchResultsMarketDetailsFragment on SEARCH_Result {\\n  details {\\n    location {\\n      cities {\\n        city\\n        state\\n        __typename\\n      }\\n      neighborhoods\\n      neighborhoodRegions {\\n        name\\n        regionId\\n        locationId\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n  seoTests {\\n    name\\n    isActive\\n    __typename\\n  }\\n  ...SearchResultsNeighborhoodsListFragment\\n  ...MarketInsightsDataFragment\\n  ...SearchResultsSummaryFragment\\n  ...SearchResultsWhatLocalsSayFragment\\n  __typename\\n}\\n\\nfragment SearchResultsNeighborhoodsListFragment on SEARCH_Result {\\n  surroundings(limit: 15) {\\n    ...NeighborhoodCardFragment\\n    ... on SURROUNDINGS_Neighborhood {\\n      neighborhoodAttribution\\n      relatedHoods {\\n        nearby {\\n          ...NeighborhoodCardFragment\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment NeighborhoodCardFragment on SURROUNDINGS_Neighborhood {\\n  name\\n  ndpActive\\n  ndpUrl\\n  regionId\\n  media(includeStoryMedia: false) {\\n    heroImage {\\n      ... on MEDIA_HeroImageMap {\\n        url {\\n          path: custom(size: {width: 136, height: 136, cropMode: fill}, zoomLevel: 1100)\\n          __typename\\n        }\\n        __typename\\n      }\\n      ... on MEDIA_HeroImageStory {\\n        url {\\n          path: custom(size: {width: 136, height: 136, cropMode: fill})\\n          __typename\\n        }\\n        __typename\\n      }\\n      ... on MEDIA_HeroImagePhoto {\\n        url {\\n          path: custom(size: {width: 136, height: 136, cropMode: fill})\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n  localFacts {\\n    forSaleStats {\\n      min\\n      max\\n      __typename\\n    }\\n    homesForSaleCount\\n    forRentStats {\\n      min\\n      max\\n      __typename\\n    }\\n    homesForRentCount\\n    soldHomesStats {\\n      min\\n      max\\n      __typename\\n    }\\n    soldHomesCount\\n    __typename\\n  }\\n  neighborhoodSearchUrlCTA {\\n    forSale\\n    forRent\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment SearchResultsWhatLocalsSayFragment on SEARCH_Result {\\n  searchLocationSurroundings {\\n    locationId\\n    name\\n    ... on SURROUNDINGS_Neighborhood {\\n      ndpType\\n      ndpUrl\\n      name\\n      ndpActive\\n      localUGC {\\n        ... on SURROUNDINGS_LocalUGC {\\n          ...LocalUGCFragment\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    ... on SURROUNDINGS_City {\\n      localUGC {\\n        ... on SURROUNDINGS_LocalUGC {\\n          ...LocalUGCFragment\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment LocalUGCFragment on SURROUNDINGS_LocalUGC {\\n  title\\n  localReviews {\\n    categories {\\n      id\\n      displayName\\n      reviewCount\\n      callToAction\\n      __typename\\n    }\\n    totalReviews\\n    reviews(limitPerCategory: 8) {\\n      id\\n      reviewer {\\n        name\\n        __typename\\n      }\\n      text\\n      context {\\n        displayName\\n        __typename\\n      }\\n      category {\\n        id\\n        displayName\\n        __typename\\n      }\\n      dateCreated\\n      reactionSummary {\\n        counts {\\n          helpful\\n          __typename\\n        }\\n        viewerReactions {\\n          helpful\\n          __typename\\n        }\\n        __typename\\n      }\\n      flagSummary {\\n        totalCount\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n  reviewHighlights @include(if: $includeReviewHighlights) {\\n    regionId\\n    text\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment SearchResultsSummaryFragment on SEARCH_Result {\\n  marketInsights(sourceAllFromZHVI: true) {\\n    rentalMarketInsights {\\n      medianRentalPriceAverageForPastYear\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment MarketInsightsDataFragment on SEARCH_Result {\\n  names(isInSeoLongTermRentalTitleTest: $isInSeoLongTermRentalTitleTest) {\\n    locationName\\n    __typename\\n  }\\n  marketInsights(sourceAllFromZHVI: true) {\\n    homeStatsByBedroomCount: statsByHomeFeature(featureType: BEDROOMS) {\\n      displayName\\n      featureStats {\\n        displayName\\n        homeValueIndexPrice\\n        inventorySummary @include(if: $isNearbyCitiesEnabled)\\n        ... on STATS_AND_TRENDS_HomeFeatureStat {\\n          forSaleSearchUrl\\n          __typename\\n        }\\n        __typename\\n      }\\n      summary {\\n        summaryDescription\\n        newListingsSearchUrl\\n        newListingsSearchCta\\n        __typename\\n      }\\n      __typename\\n    }\\n    affordability {\\n      name\\n      summary\\n      trend {\\n        value\\n        formattedValue\\n        date\\n        formattedDate(dateFormat: \\"MMMM YYYY\\")\\n        __typename\\n      }\\n      __typename\\n    }\\n    affordabilityAttribution\\n    propertyCountByFeaturesAndStyles: statsByHomeFeature(\\n      featureType: POPULAR_FEATURES\\n    ) {\\n      displayName\\n      featureStats {\\n        displayName\\n        inventorySummary\\n        forSaleSearchUrl\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n  surroundings(limit: 15) {\\n    ... on SURROUNDINGS_Neighborhood {\\n      name\\n      forSaleNeighborhoodSearchCanonicalURL\\n      localFacts {\\n        homesForSaleCount\\n        __typename\\n      }\\n      __typename\\n    }\\n    ... on SURROUNDINGS_City @include(if: $isNearbyCitiesEnabled) {\\n      __typename\\n      name\\n      media {\\n        heroImage {\\n          url {\\n            small\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      localFacts {\\n        forSaleStats {\\n          formattedPriceRange\\n          __typename\\n        }\\n        homesForSaleCount\\n        __typename\\n      }\\n      searchUrl {\\n        forSale\\n        __typename\\n      }\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment SearchResultsFooterCardFragment on SEARCH_Result {\\n  homes {\\n    ...HomeDetailsCardFragment\\n    ...HomeDetailsCardPhotosFragment\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment SearchDetailsFragment on SEARCHDETAILS_Details {\\n  searchType\\n  location {\\n    cities {\\n      city\\n      state\\n      __typename\\n    }\\n    states {\\n      state\\n      __typename\\n    }\\n    counties\\n    neighborhoods\\n    neighborhoodRegions {\\n      name\\n      regionId\\n      locationId\\n      __typename\\n    }\\n    zips\\n    schoolDistricts\\n    university {\\n      id\\n      name\\n      commuteTime\\n      commuteType\\n      __typename\\n    }\\n    school {\\n      id\\n      name\\n      __typename\\n    }\\n    customArea {\\n      latLngs {\\n        latitude\\n        longitude\\n        __typename\\n      }\\n      encodedPolygon\\n      __typename\\n    }\\n    commute {\\n      type\\n      maxTime\\n      polygons {\\n        latitude\\n        longitude\\n        __typename\\n      }\\n      label\\n      __typename\\n    }\\n    pointOfInterest {\\n      latitude\\n      longitude\\n      __typename\\n    }\\n    coordinates {\\n      center {\\n        latitude\\n        longitude\\n        __typename\\n      }\\n      southEast {\\n        latitude\\n        longitude\\n        __typename\\n      }\\n      northEast {\\n        latitude\\n        longitude\\n        __typename\\n      }\\n      southWest {\\n        latitude\\n        longitude\\n        __typename\\n      }\\n      northWest {\\n        latitude\\n        longitude\\n        __typename\\n      }\\n      __typename\\n    }\\n    radiusSize\\n    __typename\\n  }\\n  filters {\\n    isAlternateListingSource\\n    bedrooms {\\n      min\\n      max\\n      __typename\\n    }\\n    bathrooms {\\n      min\\n      max\\n      __typename\\n    }\\n    price {\\n      min\\n      max\\n      __typename\\n    }\\n    squareFeet {\\n      min\\n      max\\n      __typename\\n    }\\n    zoom\\n    street\\n    propertyTypes\\n    lotSize {\\n      min\\n      max\\n      __typename\\n    }\\n    hoaFee {\\n      min\\n      max\\n      __typename\\n    }\\n    mlsId\\n    newListing {\\n      range {\\n        min\\n        max\\n        timestamp\\n        __typename\\n      }\\n      daysAgo\\n      __typename\\n    }\\n    openHomes {\\n      range {\\n        min\\n        max\\n        timestamp\\n        __typename\\n      }\\n      __typename\\n    }\\n    percentChanged\\n    recentlyReduced {\\n      range {\\n        min\\n        max\\n        timestamp\\n        __typename\\n      }\\n      daysAgo\\n      __typename\\n    }\\n    pricePerSquareFoot {\\n      min\\n      max\\n      __typename\\n    }\\n    yearBuilt {\\n      min\\n      max\\n      __typename\\n    }\\n    keywords\\n    listingTypes\\n    foreclosureTypes\\n    discoveryGroup\\n    sort {\\n      type\\n      ascending\\n      __typename\\n    }\\n    soldWithin\\n    pets\\n    brokerFee\\n    buildingAmenities\\n    unitAmenities\\n    furnished\\n    rentalListingTags\\n    landlordPays\\n    page\\n    offset\\n    limit\\n    transit {\\n      system\\n      line\\n      station\\n      __typename\\n    }\\n    includeOffMarket\\n    isAlternateListingSource\\n    propertyAmenityTypes\\n    shortcutSearch\\n    isInverseSearch\\n    plus55Communities {\\n      exclude\\n      __typename\\n    }\\n    airConditioning {\\n      has\\n      __typename\\n    }\\n    moveInDate\\n    sceneryTypes\\n    rentSpace\\n    hasVirtualTour\\n    withParking\\n    withDisabledAccess\\n    applicationAndLease\\n    withOutdoorSpace\\n    withUtilitiesIncluded\\n    __typename\\n  }\\n  canonicalUrl\\n  description\\n  __typename\\n}\\n\\nfragment ExploreCollectionsFragmentBot on SEARCH_Result {\\n  exploreCollections(prefetch: false) {\\n    ...ExploreCollectionsFragment\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment ExploreCollectionsFragment on SEARCH_ExploreCollection {\\n  title\\n  categories\\n  id\\n  position\\n  searches {\\n    title\\n    subTitle\\n    disclaimer\\n    subTitleFormattedFilterLists\\n    ctaText\\n    searchUrl\\n    homes {\\n      location {\\n        coordinates {\\n          latitude\\n          longitude\\n          __typename\\n        }\\n        __typename\\n      }\\n      ...HomeDetailsCardFragment\\n      ...HomeDetailsCardHeroFragment\\n      ...HomeDetailsCardPhotosFragment\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment HiddenHomeSrpFragment on HOME_Details {\\n  isHideable\\n  typedHomeId\\n  __typename\\n}\\n\\nfragment HeaderAndFooterFragment on SEARCH_Result {\\n  primaryNavigation {\\n    ...Header\\n    __typename\\n  }\\n  secondaryNavigation(inFooterTest: $inFooterTest) {\\n    ...Footer\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment Header on PRIMARY_NAVIGATION_NavigationItem {\\n  label\\n  uri\\n  description\\n  children {\\n    label\\n    uri\\n    description\\n    children {\\n      label\\n      uri\\n      isNoFollow\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment Footer on SECONDARY_NAVIGATION_SecondaryNavigation {\\n  main {\\n    label\\n    uri\\n    isNoFollow\\n    children {\\n      label\\n      uri\\n      isNoFollow\\n      __typename\\n    }\\n    __typename\\n  }\\n  internal {\\n    label\\n    uri\\n    isNoFollow\\n    children {\\n      label\\n      uri\\n      isNoFollow\\n      __typename\\n    }\\n    __typename\\n  }\\n  brand {\\n    label\\n    uri\\n    isNoFollow\\n    children {\\n      label\\n      uri\\n      isNoFollow\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment SearchResultsBranchBannerFragmnet on SEARCH_Result {\\n  location {\\n    ... on SEARCH_ResultLocationState {\\n      state\\n      __typename\\n    }\\n    ... on SEARCH_ResultLocationBoundingBox {\\n      city\\n      state\\n      __typename\\n    }\\n    ... on SEARCH_ResultLocationCity {\\n      city\\n      state\\n      __typename\\n    }\\n    ... on SEARCH_ResultLocationNeighborhood {\\n      city\\n      state\\n      neighborhood\\n      __typename\\n    }\\n    ... on SEARCH_ResultLocationCounty {\\n      county\\n      state\\n      __typename\\n    }\\n    ... on SEARCH_ResultLocationNeighborhood {\\n      city\\n      state\\n      neighborhood\\n      __typename\\n    }\\n    ... on SEARCH_ResultLocationPostalCode {\\n      city\\n      state\\n      postalCode\\n      __typename\\n    }\\n    ... on SEARCH_ResultLocationSchool {\\n      city\\n      state\\n      schoolName: name\\n      __typename\\n    }\\n    ... on SEARCH_ResultLocationCustomArea {\\n      city\\n      state\\n      __typename\\n    }\\n    ... on SEARCH_ResultLocationPointOfInterest {\\n      city\\n      state\\n      __typename\\n    }\\n    ... on SEARCH_ResultLocationSchoolDistrict {\\n      city\\n      state\\n      schoolDistrictName: name\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}"}'

# Parse JSON string to dict
payload = json.loads(payload_str)
payload["variables"]["limit"] = LIMIT

# Remove duplicates and format cities
cities = list(set([
    # San Francisco County
    "San_Francisco, CA", "Daly_City, CA", "South_San_Francisco, CA",
    
    # San Mateo County
    "San_Mateo, CA", "Redwood_City, CA", "Burlingame, CA", "Foster_City, CA",
    "San_Carlos, CA", "Belmont, CA", "Menlo_Park, CA", "Palo_Alto, CA",
    "East_Palo_Alto, CA", "Millbrae, CA", "San_Bruno, CA", "Pacifica, CA",
    "Half_Moon_Bay, CA",
    
    # Santa Clara County
    "San_Jose, CA", "Sunnyvale, CA", "Santa_Clara, CA", "Mountain_View, CA",
    "Cupertino, CA", "Milpitas, CA", "Los_Altos, CA", "Los_Gatos, CA",
    "Campbell, CA", "Saratoga, CA", "Morgan_Hill, CA", "Gilroy, CA",
    "Los_Altos_Hills, CA", "Monte_Sereno, CA",
    
    # Alameda County
    "Oakland, CA", "Berkeley, CA", "Fremont, CA", "Hayward, CA",
    "San_Leandro, CA", "Alameda, CA", "Union_City, CA", "Newark, CA",
    "Pleasanton, CA", "Livermore, CA", "Dublin, CA", "Emeryville, CA",
    "Albany, CA", "Piedmont, CA", "Castro_Valley, CA",
    
    # Contra Costa County
    "Concord, CA", "Richmond, CA", "Walnut_Creek, CA", "Antioch, CA",
    "San_Ramon, CA", "Pittsburg, CA", "Martinez, CA", "Pleasant_Hill, CA",
    "Brentwood, CA", "El_Cerrito, CA", "Danville, CA", "Hercules, CA",
    "Pinole, CA", "Lafayette, CA", "Orinda, CA", "Moraga, CA",
    
    # Marin County
    "San_Rafael, CA", "Novato, CA", "Mill_Valley, CA", "Sausalito, CA",
    "Corte_Madera, CA", "Tiburon, CA", "Larkspur, CA", "San_Anselmo, CA",
    
    # Solano County
    "Vallejo, CA", "Fairfield, CA", "Vacaville, CA", "Benicia, CA",
    
    # Sonoma County (southern parts)
    "Petaluma, CA",
    
    # Napa County (southern parts)
    "Napa, CA",
]))


# Create a session to maintain cookies across requests
session = requests.Session()

# Collect all properties from all cities
all_properties = []  # keep in-memory copy for debugging / optional downstream use
pending_vectors = []

def _build_chunk_text(prop: dict) -> str:
# Focus on the 'Headline' facts first
    summary = f"A {prop.get('propertyType','property')} located at {prop.get('address','')}. "
    
    # Lifestyle details are what tenants search for
    details = (
        f"It has {prop.get('bedrooms','')} bedrooms and {prop.get('bathrooms','')} bathrooms "
        f"covering {prop.get('squareFeet','')} of living space. "
    )
    
    price = f"The monthly rent is {prop.get('price','')}. " if prop.get('price') else ""
    
    # Tags are huge for tenants (Laundry, Parking, Pets)
    amenities = f"Features and amenities include: {prop.get('tags','')}. " if prop.get('tags') else ""
    
    # Description often contains context like 'near BART' or 'quiet neighborhood'
    desc = f"Additional information: {prop.get('description','')}"
    
    return f"{summary}{details}{price}{amenities}{desc}".strip()


def _pc_metadata_value(v):
    """Pinecone metadata must be str/number/bool or list[str]. No dicts, no None."""
    if v is None:
        return ""
    if isinstance(v, (str, int, float, bool)):
        return v
    if isinstance(v, list):
        return [str(x) for x in v if x is not None]
    return str(v)

def _embed_texts(texts: list[str]) -> list[list[float]]:
    """Embed texts using Pinecone Inference API; returns list of dense vectors."""
    res = pc.inference.embed(
        model=EMBED_MODEL,
        inputs=texts,
        parameters={"input_type": "passage"},
    )
    # Support both attribute-style and dict-style responses
    data = getattr(res, "data", None) or res.get("data")  # type: ignore[attr-defined]
    vectors = []
    for item in data:
        vectors.append(getattr(item, "values", None) or item.get("values"))  # type: ignore[union-attr]
    return vectors

def _flush_upserts(batch_size: int = 50) -> None:
    # Upsert in manageable batches to avoid request limits.
    while len(pending_vectors) >= batch_size:
        batch = pending_vectors[:batch_size]
        del pending_vectors[:batch_size]

        texts = [b["chunk_text"] for b in batch]
        embeds = _embed_texts(texts)

        vectors = []
        for b, values in zip(batch, embeds):
            vectors.append(
                {
                    "id": b["id"],
                    "values": values,
                    "metadata": b["metadata"],
                }
            )
        index.upsert(namespace=namespace, vectors=vectors)

print(f"Processing {len(cities)} cities...\n")


def scrape(): 
    for idx, city in enumerate(cities, 1):
        print(f"[{idx}/{len(cities)}] Processing {city}...")
        
        # Format city for URL (replace spaces with commas, ensure proper format)
        city_url = city.replace(', ', ',').replace(' ', '-')
        
        # Generate transaction ID (UUID v4 format)
        transaction_id = str(uuid.uuid4())

        payload['variables']['url'] = f"/for_rent/{city_url}/"

        # Query parameters - add transactionId
        params = {
            "operation_name": payload["operationName"],
            "transactionId": transaction_id
        }

        # First, visit the Trulia page to establish a session and get cookies
        page_url = f'https://www.trulia.com/for_rent/{city_url}/'
        browser_headers = {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'accept-language': 'en-US,en;q=0.9',
            'accept-encoding': 'gzip, deflate, br',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Google Chrome";v="141", "Not(A:Brand";v="8", "Chromium";v="141"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1'
        }

        page_response = session.get(page_url, headers=browser_headers)
        
        # Try to extract CSRF token
        csrf_token = 'AAj4/lnMzdk7LGaho+lmq07+ezQMe9SIXsENUK5V'  # Default fallback
        if 'csrf' in session.cookies:
            csrf_token = session.cookies['csrf']
        elif 'X-CSRF-Token' in page_response.headers:
            csrf_token = page_response.headers['X-CSRF-Token']
        else:
            csrf_match = re.search(r'csrf[_-]?token["\']?\s*[:=]\s*["\']([^"\']+)', page_response.text, re.IGNORECASE)
            if csrf_match:
                csrf_token = csrf_match.group(1)

        headers = {
            'accept': '*/*',
            'content-type': 'application/json',
            'origin': 'https://www.trulia.com',
            'referer': page_url,
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
            'x-csrf-token': csrf_token,
            'accept-language': 'en-US,en;q=0.9',
            'sec-ch-ua': '"Google Chrome";v="141", "Not(A:Brand";v="8", "Chromium";v="141"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
        }


        # Send POST request
        response = session.post(
            url,
            params=params,
            headers=headers,
            json=payload
        )

        # Try to parse JSON if successful
        if response.status_code == 200:
            try:
                result = response.json()
                
                # Navigate through the GraphQL response structure (guard against `data: null`)
                data = result.get("data")
                if isinstance(data, dict) and isinstance(data.get("searchHomesByUrl"), dict):
                    search_result = data["searchHomesByUrl"]
                    
                    # Get homes from the search result
                    homes = search_result.get("homes")
                    if isinstance(homes, list):
                        print(f"Found {len(homes)} properties")
                        
                        for home in homes:
                            # Extract property details
                            coords = home.get("location", {}).get("coordinates") or {}
                            if not isinstance(coords, dict):
                                coords = {}
                            prop_data = {
                                'searchCity': city,  # Add the search city as a column
                                'id': home.get('metadata', {}).get('compositeId', ''),
                                'url': 'https://www.trulia.com' + home.get('url', '') if home.get('url') else '',
                                'homeUrl': home.get('homeUrl') or '',
                                'address': home.get('location', {}).get('fullLocation', home.get('location', {}).get('streetAddress', '')),
                                'streetAddress': home.get('location', {}).get('streetAddress', ''),
                                'city': home.get('location', {}).get('city', ''),
                                'state': home.get('location', {}).get('stateCode', ''),
                                'zipCode': home.get('location', {}).get('zipCode', ''),
                                'latitude': coords.get('latitude', ''),
                                'longitude': coords.get('longitude', ''),
                                'price': home.get('price', {}).get('formattedPrice', ''),
                                'bedrooms': home.get('bedrooms', {}).get('formattedValue', '') if isinstance(home.get('bedrooms'), dict) else str(home.get('bedrooms', {}).get('value', '')) if isinstance(home.get('bedrooms'), dict) else '',
                                'bathrooms': home.get('bathrooms', {}).get('formattedValue', '') if isinstance(home.get('bathrooms'), dict) else str(home.get('bathrooms', {}).get('value', '')) if isinstance(home.get('bathrooms'), dict) else '',
                                'squareFeet': home.get('floorSpace', {}).get('formattedDimension', ''),
                                'lotSize': home.get('lotSize', {}).get('formattedDimension', '') if isinstance(home.get('lotSize'), dict) else '',
                                'propertyType': home.get('__typename', ''),
                                'description': home.get('description', {}).get('value', '') if isinstance(home.get('description'), dict) else '',
                                'imageUrl': '',
                                'dateListed': '',
                                'listingSource': ''
                            }
                            
                            # Extract image URL (guard against `media: null`)
                            media = home.get("media")
                            if isinstance(media, dict):
                                hero_img = media.get("heroImage")
                                if isinstance(hero_img, dict):
                                    hero_url = hero_img.get("url")
                                    if isinstance(hero_url, dict):
                                        prop_data["imageUrl"] = hero_url.get("medium", hero_url.get("small", ""))
                            
                            # Extract listing info for properties (guard against `activeListing/provider: null`)
                            listing = home.get("activeListing")
                            if isinstance(listing, dict):
                                if "dateListed" in listing:
                                    prop_data["dateListed"] = listing.get("dateListed", "")
                                provider = listing.get("provider")
                                if isinstance(provider, dict) and "summary" in provider:
                                    prop_data["listingSource"] = provider.get("summary") or ""
                            
                            # Extract tags
                            tags = []
                            home_tags = home.get("tags")
                            if isinstance(home_tags, list):
                                for tag in home_tags:
                                    if isinstance(tag, dict) and "formattedName" in tag:
                                        tags.append(tag.get("formattedName", ""))
                            prop_data['tags'] = ', '.join(tags)
                            
                            all_properties.append(prop_data)

                            # Upsert to Pinecone (docs-style: embed -> upsert vectors)
                            record_id = prop_data.get("id") or str(uuid.uuid4())
                            chunk_text = _build_chunk_text(prop_data)
                            metadata = {
                                "searchCity": _pc_metadata_value(prop_data.get("searchCity")),
                                "url": _pc_metadata_value(prop_data.get("url")),
                                "homeUrl": _pc_metadata_value(prop_data.get("homeUrl")),
                                "address": _pc_metadata_value(prop_data.get("address")),
                                "streetAddress": _pc_metadata_value(prop_data.get("streetAddress")),
                                "city": _pc_metadata_value(prop_data.get("city")),
                                "state": _pc_metadata_value(prop_data.get("state")),
                                "zipCode": _pc_metadata_value(prop_data.get("zipCode")),
                                "latitude": _pc_metadata_value(prop_data.get("latitude")),
                                "longitude": _pc_metadata_value(prop_data.get("longitude")),
                                "price": _pc_metadata_value(prop_data.get("price")),
                                "bedrooms": _pc_metadata_value(prop_data.get("bedrooms")),
                                "bathrooms": _pc_metadata_value(prop_data.get("bathrooms")),
                                "squareFeet": _pc_metadata_value(prop_data.get("squareFeet")),
                                "lotSize": _pc_metadata_value(prop_data.get("lotSize")),
                                "propertyType": _pc_metadata_value(prop_data.get("propertyType")),
                                "tags": _pc_metadata_value(prop_data.get("tags")),
                                "imageUrl": _pc_metadata_value(prop_data.get("imageUrl")),
                                "dateListed": _pc_metadata_value(prop_data.get("dateListed")),
                                "listingSource": _pc_metadata_value(prop_data.get("listingSource")),
                            }

                            pending_vectors.append(
                                {
                                    "id": record_id,
                                    "chunk_text": chunk_text,
                                    "metadata": metadata,
                                }
                            )
                            _flush_upserts(batch_size=50)
                    else:
                        print(f"No homes found in response")
                else:
                    print(f"Unexpected response structure")
                    
            except json.JSONDecodeError as e:
                print(f"JSON Decode Error: {e}")
            except Exception as e:
                print(f"Error processing data: {e}")

        else:
            print(f"  Request failed with status {response.status_code}")

        time.sleep(random.randint(30, 60)) # sleep for 30 to 60 seconds

    # Final flush to Pinecone
    if pending_vectors:
        # Embed & upsert whatever remains
        texts = [b["chunk_text"] for b in pending_vectors]
        embeds = _embed_texts(texts)
        vectors = []
        for b, values in zip(pending_vectors, embeds):
            vectors.append({"id": b["id"], "values": values, "metadata": b["metadata"]})
        index.upsert(namespace=namespace, vectors=vectors)
        pending_vectors.clear()

    if all_properties:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'trulia_properties_all_cities_{timestamp}.csv'
        
        # Define CSV columns - add searchCity as the first column
        fieldnames = [
            'searchCity', 'id', 'url', 'homeUrl', 'address', 'streetAddress', 'city', 'state', 'zipCode',
            'latitude', 'longitude', 'price', 'bedrooms', 'bathrooms', 'squareFeet', 'lotSize',
            'propertyType', 'tags', 'description', 'imageUrl', 'dateListed', 'listingSource'
        ]
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(all_properties)
        
        print(f"\n✅ Successfully saved {len(all_properties)} properties from {len(cities)} cities to {filename}")
        print(f"\n✅ Successfully upserted {len(all_properties)} properties from {len(cities)} cities into Pinecone index: {index_name}")
        return all_properties
    else:
        print("\n⚠️  No properties found across all cities.")
        return []

if __name__ == "__main__":
    scrape()
