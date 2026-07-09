"use client";

import {
  SquaresFour,
  Users,
  HandCoins,
  CalendarCheck,
  ChartBar,
  Calculator,
  WhatsappLogo,
  UserGear,
  Car,
  Gear,
  ArrowsClockwise,
} from "@phosphor-icons/react";

export type IconProps = { className?: string };

export const DashboardIcon = (p: IconProps) => <SquaresFour {...p} />;
export const CustomersIcon = (p: IconProps) => <Users {...p} />;
export const LoansIcon = (p: IconProps) => <HandCoins {...p} />;
export const InstallmentsIcon = (p: IconProps) => <CalendarCheck {...p} />;
export const ReportsIcon = (p: IconProps) => <ChartBar {...p} />;
export const CalculatorIcon = (p: IconProps) => <Calculator {...p} />;
export const WhatsappIcon = (p: IconProps) => <WhatsappLogo {...p} />;
export const UsersIcon = (p: IconProps) => <UserGear {...p} />;
export const VehiclesIcon = (p: IconProps) => <Car {...p} />;
export const SettingsIcon = (p: IconProps) => <Gear {...p} />;
export const CapitalIcon = (p: IconProps) => <ArrowsClockwise {...p} />;
