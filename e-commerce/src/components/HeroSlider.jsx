// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// import required modules
import { Autoplay, Pagination, Navigation } from "swiper/modules";

const slides = [
  {
    image: "images/slides/slide (1).png",
  },
  {
    image: "images/slides/slide (2).png",
  },
  {
    image: "images/slides/slide (3).png",
  },
  {
    image: "images/slides/slide (4).png",
  },
];

export default function App() {
  return (
    <Swiper
      slidesPerView={1}
      spaceBetween={30}
      centeredSlides={true}
      loop={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      navigation={true}
      modules={[Autoplay, Pagination, Navigation]}
      className="mySwiper overflow-hidden rounded-2xl"
    >
      {slides.map((slide) => (
        <SwiperSlide key={slide.image}>
          <img
            src={slide.image}
            alt=""
            className="h-[240px] w-full object-cover sm:h-[320px] lg:h-[420px]"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
