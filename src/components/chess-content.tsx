"use client";

import { Typography } from "@material-tailwind/react";
import AboutCard from "./card/home-chess-card";

const GAME_INFO = [
  {
    title: "Xiangqi",
    description:
      "Immerse yourself in the ancient art of Chinese Chess, where strategic placement and tactical moves determine the winner.",
    subTitle: "Cultural Legacy",
    imageUrl: "https://static3.bigstockphoto.com/1/2/5/large1500/52149265.jpg",
  },
  {
    title: "Go",
    description:
      "One of the oldest board games, Go offers endless possibilities and requires deep strategic thinking to dominate the board.",
    subTitle: "Endless Possibilities",
    imageUrl:
      "https://cdnphoto.dantri.com.vn/mvXVVkYqDvrUE23jW_mNI-a5TlM=/thumb_w/1020/2024/02/26/nuthancovay-3-1708892742007.jpeg",
  },
];

export function ChessContent() {
  return (
    <section className="container mx-auto flex flex-col items-center px-4 py-10">
      <Typography variant="h3" className="text-center" color="blue-gray">
        Find Your Perfect Chess Partner
      </Typography>
      <Typography
        variant="lead"
        className="mt-2 lg:max-w-4xl mb-8 w-full text-center font-normal !text-gray-500"
      >
        Schedule individual or group chess games with players who match your
        skill level and preferred time. Choose between Chess, Xiangqi, or Go.
      </Typography>
      <div className="mt-8 w-full grid grid-cols-1 md:grid-cols-2 gap-4 ">
        {GAME_INFO.map((props, idx) => (
          <AboutCard key={idx} {...props} />
        ))}
        <div className="md:col-span-2">
          <AboutCard
            title="Chess!"
            subTitle="Strategy & Skills"
            description="A timeless classic, Chess challenges players to outthink their opponents with strategy and foresight. Perfect for players of all skill levels."
            imageUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Chess_pieces_close_up.jpg/640px-Chess_pieces_close_up.jpg"
          />
        </div>
      </div>
    </section>
  );
}

export default ChessContent;
