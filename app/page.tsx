import { Audience } from "@/components/sections/Audience";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Hero } from "@/components/sections/Hero";
import { LaunchStack } from "@/components/sections/LaunchStack";
import { NotACourse } from "@/components/sections/NotACourse";
import { Outcome } from "@/components/sections/Outcome";
import { Price } from "@/components/sections/Price";
import { Process } from "@/components/sections/Process";
import { ValueStrip } from "@/components/sections/ValueStrip";
import { WhatInside } from "@/components/sections/WhatInside";
import { LeadForm } from "@/components/forms/LeadForm";
import { Container } from "@/components/Container";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ValueStrip />
      <WhatInside />
      <Process />
      <Outcome />
      <Audience />
      <NotACourse />
      <LaunchStack />
      <Price />
      <Container>
        <LeadForm />
      </Container>
      <FAQ />
      <FinalCTA />
    </>
  );
}
