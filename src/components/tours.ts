import type { DriveStep } from "driver.js";
import type { Translator } from "@/lib/i18n/dictionaries";

export type TourId =
  | "welcome"
  | "customers"
  | "loans"
  | "vehicles"
  | "customerForm"
  | "loanForm"
  | "vehicleForm";

/** Builds the steps for a feature tour, translated. */
export function buildTour(id: TourId, t: Translator): DriveStep[] {
  switch (id) {
    case "welcome":
      return [
        {
          popover: {
            title: t("tour.welcome.title"),
            description: t("tour.welcome.desc"),
          },
        },
        { popover: { description: t("tour.welcome.flow") } },
        {
          element: '[data-tour="new-loan"]',
          popover: {
            title: t("loans.new"),
            description: t("tour.welcome.newLoan"),
            side: "bottom",
            align: "end",
          },
        },
      ];
    case "customers":
      return [
        {
          element: '[data-tour="new-customer"]',
          popover: {
            title: t("customers.new"),
            description: t("tour.customers.new"),
            side: "bottom",
            align: "end",
          },
        },
        {
          element: '[data-tour="search"]',
          popover: { description: t("tour.customers.search"), side: "bottom" },
        },
      ];
    case "loans":
      return [
        {
          element: '[data-tour="new-loan"]',
          popover: {
            title: t("loans.new"),
            description: t("tour.loans.new"),
            side: "bottom",
            align: "end",
          },
        },
      ];
    case "vehicles":
      return [
        {
          element: '[data-tour="new-vehicle"]',
          popover: {
            title: t("vehicles.new"),
            description: t("tour.vehicles.new"),
            side: "bottom",
            align: "end",
          },
        },
      ];
    case "customerForm":
      return [
        { popover: { description: t("tour.customerForm.intro") } },
        {
          element: "#name",
          popover: { description: t("tour.customerForm.name"), side: "bottom" },
        },
        {
          element: '[data-tour="cf-address"]',
          popover: { description: t("tour.customerForm.address"), side: "top" },
        },
        {
          element: '[data-tour="cf-referral"]',
          popover: { description: t("tour.customerForm.referral"), side: "top" },
        },
      ];
    case "loanForm":
      return [
        { popover: { description: t("tour.loanForm.intro") } },
        {
          element: "#customer_id",
          popover: { description: t("tour.loanForm.customer"), side: "bottom" },
        },
        {
          element: "#principal",
          popover: { description: t("tour.loanForm.principal"), side: "bottom" },
        },
        {
          element: '[data-tour="lf-total"]',
          popover: { description: t("tour.loanForm.total"), side: "top" },
        },
        {
          element: '[data-tour="lf-installments"]',
          popover: { description: t("tour.loanForm.installments"), side: "top" },
        },
      ];
    case "vehicleForm":
      return [
        { popover: { description: t("tour.vehicleForm.intro") } },
        {
          element: "#type",
          popover: { description: t("tour.vehicleForm.type"), side: "bottom" },
        },
        {
          element: '[data-tour="vf-specs"]',
          popover: { description: t("tour.vehicleForm.specs"), side: "top" },
        },
        {
          element: '[data-tour="vf-features"]',
          popover: { description: t("tour.vehicleForm.features"), side: "top" },
        },
        {
          element: '[data-tour="vf-docs"]',
          popover: { description: t("tour.vehicleForm.docs"), side: "top" },
        },
      ];
    default:
      return [];
  }
}
