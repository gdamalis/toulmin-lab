import type { ToulminArgument } from "@/types/toulmin";

// Sample data for initial demo
export const sampleArgument: ToulminArgument = {
  name: "Renewable Energy Proposal",
  author: "Environmental Policy Team",
  claim: "We should implement renewable energy sources",
  grounds: "Fossil fuels are depleting and causing climate change",
  groundsBacking:
    "Scientific studies show global temperature rising due to CO2 emissions",
  warrant: "Renewable energy is sustainable and reduces carbon emissions",
  warrantBacking:
    "Wind and solar power produce zero emissions during operation",
  qualifier: "In most developed countries",
  rebuttal: "Unless the infrastructure costs prove prohibitively expensive",
};

// Empty argument template
export const emptyArgument: ToulminArgument = {
  name: "",
  author: "",
  claim: "",
  grounds: "",
  groundsBacking: "",
  warrant: "",
  warrantBacking: "",
  qualifier: "",
  rebuttal: "",
}; 