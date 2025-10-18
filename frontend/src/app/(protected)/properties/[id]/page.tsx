"use client";

import { useRouter } from "next/navigation";
import { useState, use, useEffect, useRef } from "react";
import { Property } from "@/types";
import { useProperty } from "@/contexts/PropertyContext";
import { useProperties } from "@/hooks/useProperties";
import { useRoommates } from "@/hooks/useRoommates";
import Link from "next/link";
import {
  FaBed,
  FaBath,
  FaRulerCombined,
  FaWifi,
  FaParking,
  FaSwimmingPool,
  FaDumbbell,
  FaSnowflake,
  FaUtensils,
  FaMapMarkerAlt,
  FaStar,
  FaUser,
} from "react-icons/fa";
import {
  MdPets,
  MdSecurity,
  MdCleaningServices,
  MdOutdoorGrill,
  MdLocalLaundryService,
} from "react-icons/md";
import { GoogleMap, Marker } from "@react-google-maps/api";

const PropertyDetail = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter();
  const { selectedProperty, setSelectedProperty } = useProperty();
  const { fetchPropertyById, setHouseInterest, property: fetchedProperty } = useProperties();
  const [property, setProperty] = useState<Property | null>(null);
  const [showRoommatePopup, setShowRoommatePopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { roommates, fetchRoommatesByStatus } = useRoommates();
  const [isLoading, setIsLoading] = useState(true);

  const propertyFetched = useRef(false);
  const roommatesFetched = useRef(false);

  useEffect(() => {
    const loadProperty = async () => {
      const resolvedParams = await params;
      const propertyId = resolvedParams.id;

      if (propertyFetched.current) return;
      propertyFetched.current = true;

      setIsLoading(true);
      try {
        if (selectedProperty && selectedProperty._id === propertyId) {
          setProperty(selectedProperty);
        } else if (fetchedProperty && fetchedProperty._id === propertyId) {
          setProperty(fetchedProperty);
          setSelectedProperty(fetchedProperty);
        } else {
          const result = await fetchPropertyById.mutateAsync(propertyId);
          setProperty(result);
          setSelectedProperty(result);
        }
      } catch (error) {
        console.error("Error loading property:", error);
        router.push("/properties");
      } finally {
        setIsLoading(false);
      }
    };

    loadProperty();
  }, [params, selectedProperty, fetchedProperty, fetchPropertyById, router]);

  useEffect(() => {
    if (roommatesFetched.current) return; // Prevent multiple calls
    roommatesFetched.current = true;

    fetchRoommatesByStatus.mutateAsync("accepted").catch((error) => {
      console.error("Error loading roommates:", error);
    });
  }, [fetchRoommatesByStatus]);

  const filteredRoommates = roommates.filter((roommate) =>
    roommate.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const propertyImages = Array.isArray(property?.image) && property?.image.length
    ? property.image
    : ["https://images.unsplash.com/photo-1560185893-a55cbc8c57e8"];

  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes("wifi")) return <FaWifi className="text-primary" />;
    if (amenityLower.includes("parking")) return <FaParking className="text-primary" />;
    if (amenityLower.includes("pool")) return <FaSwimmingPool className="text-primary" />;
    if (amenityLower.includes("gym")) return <FaDumbbell className="text-primary" />;
    if (amenityLower.includes("air")) return <FaSnowflake className="text-primary" />;
    if (amenityLower.includes("kitchen")) return <FaUtensils className="text-primary" />;
    if (amenityLower.includes("pet")) return <MdPets className="text-primary" />;
    if (amenityLower.includes("security")) return <MdSecurity className="text-primary" />;
    if (amenityLower.includes("cleaning")) return <MdCleaningServices className="text-primary" />;
    if (amenityLower.includes("grill")) return <MdOutdoorGrill className="text-primary" />;
    if (amenityLower.includes("laundry")) return <MdLocalLaundryService className="text-primary" />;
    return <FaStar className="text-primary" />;
  };

  const mapContainerStyle: React.CSSProperties = {
    height: "100%",
    width: "100%",
  };

  if (isLoading || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 rounded-xl shadow-lg bg-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-xl font-medium text-tertiary">Loading property details...</h3>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-[50vh] w-full">
        <div className="absolute inset-0">
          <div className="grid grid-cols-4 grid-rows-2 h-full gap-1">
            <div className="col-span-2 row-span-2 relative">
              <img src={propertyImages[0]} alt={property.name} className="w-full h-full object-cover" />
            </div>
            {propertyImages.slice(1, 5).map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={img}
                  alt={`${property.name} view ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-30"></div>
        </div>

        <div className="absolute bottom-8 left-8 text-white">
          <h1 className="text-4xl font-bold drop-shadow-lg">{property.name}</h1>
          <div className="flex items-center mt-2">
            <FaMapMarkerAlt className="mr-2" />
            <span className="text-lg">{property.propertyLocation.address}</span>
          </div>
        </div>

        <button
          onClick={() => router.push("/properties")}
          className="absolute top-6 left-6 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-tertiary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <div className="border-b border-gray-200 pb-6 mb-6">
                <h2 className="text-3xl font-bold text-tertiary">{property.name}</h2>
                <div className="flex items-center mt-2 text-gray-600">
                  <FaMapMarkerAlt className="mr-2 text-primary" />
                  <span>{property.propertyLocation.address}</span>
                </div>
                <div className="flex flex-wrap items-center mt-4 gap-4">
                  <div className="flex items-center">
                    <FaBed className="mr-2 text-primary text-xl" />
                    <span className="text-lg">{property.bedrooms} Bedrooms</span>
                  </div>
                  <div className="flex items-center">
                    <FaBath className="mr-2 text-primary text-xl" />
                    <span className="text-lg">{property.bathrooms} Bathrooms</span>
                  </div>
                  <div className="flex items-center">
                    <FaRulerCombined className="mr-2 text-primary text-xl" />
                    <span className="text-lg">{property.sqft || "N/A"} m2</span>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-tertiary mb-4">About this property</h3>
                <p className="text-gray-700 leading-relaxed">
                  {property.description || "No description available."}
                </p>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-tertiary mb-4">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4">
                  {property.amenities?.map((amenity, index) => (
                    <div key={index} className="flex items-center">
                      {getAmenityIcon(amenity)}
                      <span className="ml-3 text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-tertiary mb-4">Location</h3>
                <div className="bg-gray-200 h-64 rounded-lg overflow-hidden">
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={{
                      lat: property.propertyLocation.coordinates.lat,
                      lng: property.propertyLocation.coordinates.lng,
                    }}
                    zoom={13}
                  >
                    <Marker
                      position={{
                        lat: property.propertyLocation.coordinates.lat,
                        lng: property.propertyLocation.coordinates.lng,
                      }}
                      title={property.propertyLocation.address}
                    />
                  </GoogleMap>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 sticky top-6">
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-bold text-primary">€{property.price}</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={async () => {
                      await setHouseInterest.mutateAsync({ houseId: property._id, status: "interested" });
                    }}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-lg font-medium transition duration-300 flex items-center justify-center"
                  >
                    <FaUser className="mr-2" />
                    Show Interest
                  </button>
                  <Link
                    href={property.link || ""}
                    className="w-full bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center"
                    target="_blank"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Visit Listing
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {showRoommatePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-primary-dark text-white p-6">
              <h2 className="text-2xl font-bold">Select Roommate</h2>
              <p className="text-sm opacity-80 mt-1">
                Choose someone to apply with for {property.name}
              </p>
            </div>

            <div className="p-6">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search roommates"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400 absolute left-3 top-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200">
                {filteredRoommates.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {filteredRoommates.map((roommate) => (
                      <li
                        key={roommate.id}
                        className="flex items-center p-4 hover:bg-gray-50 transition cursor-pointer"
                      >
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden relative">
                            <img
                              src={roommate.image || "https://via.placeholder.com/40"}
                              alt={roommate.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://via.placeholder.com/40";
                              }}
                            />
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="font-medium text-gray-900">{roommate.name}</h4>
                          <div className="flex items-center mt-1">
                            <div className="flex items-center text-yellow-500 mr-3">
                              <FaStar className="text-sm mr-1" />
                              <span className="text-sm text-gray-700">4.8</span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {roommate.hobbies.length} preference matches
                            </div>
                          </div>
                        </div>
                        <div>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <div className="mx-auto h-12 w-12 text-gray-400 mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-full w-full"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                    <p>No accepted roommates found</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 flex justify-end">
              <button
                onClick={() => setShowRoommatePopup(false)}
                className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg font-medium hover:bg-gray-300 transition mr-3"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;