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

// Spanish translation of the sample argument
export const sampleToulminArgumentES: ToulminArgument = {
  name: "Propuesta de Energía Renovable",
  author: {
    _id: "sample-author-id",
    name: "Equipo de Política Ambiental",
    userId: "",
  },
  parts: {
    claim: "Deberíamos implementar fuentes de energía renovable",
    grounds: "Los combustibles fósiles se están agotando y causando el cambio climático",
    groundsBacking:
      "Estudios científicos muestran que la temperatura global está aumentando debido a las emisiones de CO2",
    warrant: "La energía renovable es sostenible y reduce las emisiones de carbono",
    warrantBacking:
      "La energía eólica y solar no producen emisiones durante su operación",
    qualifier: "En la mayoría de los países desarrollados",
    rebuttal: "A menos que los costos de infraestructura resulten prohibitivamente caros",
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
