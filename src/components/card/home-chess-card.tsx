import { Card, CardBody, Typography, Button } from "@material-tailwind/react";

interface AboutCardProp {
  title: string;
  subTitle: string;
  description: string;
  imageUrl: string;
}

export function AboutCard({
  title,
  description,
  subTitle,
  imageUrl,
}: AboutCardProp) {
  return (
    <Card shadow={false} className="relative overflow-hidden rounded-2xl">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${imageUrl})`,
        }}
      ></div>

      <div className="absolute inset-0 bg-black/50"></div>

      <CardBody className="relative h-[500px] p-5 flex flex-col justify-center items-center text-center text-white">
        <Typography variant="h6" className="mb-4">
          {subTitle}
        </Typography>
        <Typography variant="h4" className="mb-4">
          {title}
        </Typography>
        <Typography className="mb-10 text-base w-full lg:w-8/12 font-normal">
          {description}
        </Typography>
        <Button color="white" size="sm">
          Book Now
        </Button>
      </CardBody>
    </Card>
  );
}

export default AboutCard;
