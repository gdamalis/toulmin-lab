import { ToulminArgument } from "@/types/client";

// Sample data for initial demo
export const sampleToulminArgument: ToulminArgument = {
  name: "Renewable Energy Proposal",
  author: {
    _id: "sample-author-id",
    name: "Environmental Policy Team",
    userId: "",
  },
  parts: {
    claim: "We should implement renewable energy sources",
    grounds: "Fossil fuels are depleting and causing climate change",
    groundsBacking:
      "Scientific studies show global temperature rising due to CO2 emissions",
    warrant: "Renewable energy is sustainable and reduces carbon emissions",
    warrantBacking:
      "Wind and solar power produce zero emissions during operation",
    qualifier: "In most developed countries",
    rebuttal: "Unless the infrastructure costs prove prohibitively expensive",
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Empty argument template
export const emptyToulminArgument: ToulminArgument = {
  name: "",
  author: {
    _id: "",
    name: "",
    userId: "",
  },
  parts: {
    claim: "",
    grounds: "",
    groundsBacking: "",
    warrant: "",
    warrantBacking: "",
    qualifier: "",
    rebuttal: "",
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};
