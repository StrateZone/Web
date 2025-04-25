import React from "react";
import { Button } from "@material-tailwind/react";
import { FaMapMarkerAlt, FaBriefcase, FaUniversity } from "react-icons/fa";

export default function UserProfile() {
  // Mock user data (replace with actual data source)
  const user = {
    fullName: "Jenna Stones",
    location: "Los Angeles, California",
    job: "Solution Manager - Creative Tim Officer",
    university: "University of Computer Science",
    friends: 22,
    photos: 10,
    comments: 89,
    topContributor: true, // Add this field to indicate top contributor status
  };

  return (
    <main className="profile-page">
      <section className="relative block h-[500px]">
        <div
          className="absolute top-0 w-full h-full bg-center bg-cover"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1499336315816-097655dcfbda?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2710&q=80')",
          }}
        >
          <span
            id="blackOverlay"
            className="w-full h-full absolute opacity-50 bg-black"
          ></span>
        </div>
        <div
          className="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-[70px]"
          style={{ transform: "translateZ(0px)" }}
        >
          <svg
            className="absolute bottom-0 overflow-hidden"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            version="1.1"
            viewBox="0 0 2560 100"
            x="0"
            y="0"
          >
            <polygon
              className="text-blueGray-200 fill-current"
              points="2560 0 2560 100 0 100"
            ></polygon>
          </svg>
        </div>
      </section>
      <section className="relative py-16 bg-blueGray-200">
        <div className="container mx-auto px-4">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg -mt-96">
            <div className="px-6">
              <div className="flex flex-wrap justify-center">
                <div className="w-full lg:w-3/12 px-4 lg:order-2 flex justify-center">
                  <div className="relative">
                    <img
                      alt="..."
                      src="https://demos.creative-tim.com/notus-js/assets/img/team-2-800x800.jpg"
                      className={`shadow-xl rounded-full h-auto align-middle border-none absolute -m-16 -ml-20 lg:-ml-16 max-w-[150px] ${
                        user.topContributor
                          ? "border-2 border-purple-500 shadow-lg shadow-purple-500/20"
                          : ""
                      }`}
                    />
                  </div>
                </div>
                <div className="w-full lg:w-4/12 px-4 lg:order-3 lg:text-right lg:self-center">
                  <div className="py-6 px-3 mt-32 sm:mt-0">
                    <Button
                      variant="filled"
                      color="pink"
                      className="text-white font-bold text-xs px-4 py-2 rounded"
                    >
                      Edit profile
                    </Button>
                  </div>
                </div>
                <div className="w-full lg:w-4/12 px-4 lg:order-1">
                  <div className="flex justify-center py-4 lg:pt-4 pt-8">
                    <div className="mr-4 p-3 text-center">
                      <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600">
                        {user.friends}
                      </span>
                      <span className="text-sm text-blueGray-400">Friends</span>
                    </div>
                    <div className="mr-4 p-3 text-center">
                      <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600">
                        {user.photos}
                      </span>
                      <span className="text-sm text-blueGray-400">Photos</span>
                    </div>
                    <div className="lg:mr-4 p-3 text-center">
                      <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600">
                        {user.comments}
                      </span>
                      <span className="text-sm text-blueGray-400">
                        Comments
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center mt-12">
                <div className="flex items-center justify-center gap-2">
                  <h3
                    className={`text-4xl font-semibold leading-normal mb-2 text-blueGray-700 ${
                      user.topContributor ? "text-purple-600" : ""
                    }`}
                  >
                    {user.fullName}
                  </h3>
                  {user.topContributor && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      TOP CONTRIBUTOR
                    </span>
                  )}
                </div>
                <div className="text-sm leading-normal mt-0 mb-2 text-blueGray-400 font-bold uppercase">
                  <FaMapMarkerAlt className="inline-block text-lg mr-2 text-blueGray-400" />
                  {user.location}
                </div>
                <div className="mb-2 text-blueGray-600 mt-10">
                  <FaBriefcase className="inline-block text-lg mr-2 text-blueGray-400" />
                  {user.job}
                </div>
                <div className="mb-2 text-blueGray-600">
                  <FaUniversity className="inline-block text-lg mr-2 text-blueGray-400" />
                  {user.university}
                </div>
                {user.topContributor && (
                  <p className="text-purple-500 text-sm mt-1">
                    Top Contributor
                  </p>
                )}
              </div>
              <div className="mt-10 py-10 border-t border-blueGray-200 text-center">
                <div className="flex flex-wrap justify-center">
                  <div className="w-full lg:w-9/12 px-4">
                    <p className="mb-4 text-lg leading-relaxed text-blueGray-700">
                      An artist of considerable range, Jenna the name taken by
                      Melbourne-raised, Brooklyn-based Nick Murphy writes,
                      performs and records all of his own music, giving it a
                      warm, intimate feel with a solid groove structure. An
                      artist of considerable range.
                    </p>
                    <a href="#pablo" className="font-normal text-pink-500">
                      Show more
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer className="relative bg-blueGray-200 pt-8 pb-6 mt-8"></footer>
      </section>
    </main>
  );
}
