import { ToulminArgument } from "@/types/client";

// Sample data for initial demo - Renewable Energy (Policy/Science)
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
    grounds:
      "Los combustibles fósiles se están agotando y causando el cambio climático",
    groundsBacking:
      "Estudios científicos muestran que la temperatura global está aumentando debido a las emisiones de CO2",
    warrant:
      "La energía renovable es sostenible y reduce las emisiones de carbono",
    warrantBacking:
      "La energía eólica y solar no producen emisiones durante su operación",
    qualifier: "En la mayoría de los países desarrollados",
    rebuttal:
      "A menos que los costos de infraestructura resulten prohibitivamente caros",
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

// Theological sample - Divine Command Theory
export const theologicalSampleArgument: ToulminArgument = {
  name: "Divine Command Theory",
  author: {
    _id: "sample-author-id-2",
    name: "Theology Department",
    userId: "",
  },
  parts: {
    claim: "Moral obligations are grounded in God's commands",
    grounds:
      "Throughout history, religious communities have derived their ethical frameworks from divine revelation and sacred texts",
    groundsBacking:
      "The Ten Commandments and Sermon on the Mount have shaped Western moral philosophy for over two millennia",
    warrant:
      "If moral truths require an objective, transcendent foundation, then a divine lawgiver provides the necessary grounding",
    warrantBacking:
      "Philosophers like William Lane Craig argue that objective moral values require a theistic foundation to avoid moral relativism",
    qualifier: "For those who accept theistic premises",
    rebuttal:
      "Unless one accepts Euthyphro's dilemma, which questions whether goodness is independent of divine will",
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const theologicalSampleArgumentES: ToulminArgument = {
  name: "Teoría del Mandato Divino",
  author: {
    _id: "sample-author-id-2",
    name: "Departamento de Teología",
    userId: "",
  },
  parts: {
    claim:
      "Las obligaciones morales están fundamentadas en los mandamientos de Dios",
    grounds:
      "A lo largo de la historia, las comunidades religiosas han derivado sus marcos éticos de la revelación divina y los textos sagrados",
    groundsBacking:
      "Los Diez Mandamientos y el Sermón del Monte han moldeado la filosofía moral occidental por más de dos milenios",
    warrant:
      "Si las verdades morales requieren un fundamento objetivo y trascendente, entonces un legislador divino proporciona la base necesaria",
    warrantBacking:
      "Filósofos como William Lane Craig argumentan que los valores morales objetivos requieren un fundamento teísta para evitar el relativismo moral",
    qualifier: "Para aquellos que aceptan premisas teístas",
    rebuttal:
      "A menos que se acepte el dilema de Eutifrón, que cuestiona si la bondad es independiente de la voluntad divina",
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Philosophical sample - Socratic Argument for Justice
export const philosophicalSampleArgument: ToulminArgument = {
  name: "Socratic Argument for Justice",
  author: {
    _id: "sample-author-id-3",
    name: "Philosophy Department",
    userId: "",
  },
  parts: {
    claim: "Justice is intrinsically valuable and benefits the just person",
    grounds:
      "Socrates chose death over compromising his principles, demonstrating that the just life has value beyond material rewards",
    groundsBacking:
      "In Plato's Crito, Socrates refuses to escape prison because doing so would be unjust, regardless of the personal cost",
    warrant:
      "If a person consistently chooses justice even at great personal sacrifice, then justice must have intrinsic value",
    warrantBacking:
      "The Republic argues that the just soul is harmonious and healthy, while the unjust soul is in conflict with itself",
    qualifier: "According to the Socratic-Platonic tradition",
    rebuttal:
      "Unless one accepts Thrasymachus's view that justice is merely the advantage of the stronger",
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const philosophicalSampleArgumentES: ToulminArgument = {
  name: "Argumento Socrático sobre la Justicia",
  author: {
    _id: "sample-author-id-3",
    name: "Departamento de Filosofía",
    userId: "",
  },
  parts: {
    claim:
      "La justicia es intrínsecamente valiosa y beneficia a la persona justa",
    grounds:
      "Sócrates eligió la muerte antes que comprometer sus principios, demostrando que la vida justa tiene valor más allá de las recompensas materiales",
    groundsBacking:
      "En el Critón de Platón, Sócrates se niega a escapar de prisión porque hacerlo sería injusto, sin importar el costo personal",
    warrant:
      "Si una persona elige consistentemente la justicia incluso con gran sacrificio personal, entonces la justicia debe tener valor intrínseco",
    warrantBacking:
      "La República argumenta que el alma justa es armoniosa y saludable, mientras que el alma injusta está en conflicto consigo misma",
    qualifier: "Según la tradición socrático-platónica",
    rebuttal:
      "A menos que se acepte la visión de Trasímaco de que la justicia es simplemente la ventaja del más fuerte",
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Sample arguments arrays for cycling in the landing page
export const sampleArguments: ToulminArgument[] = [
  philosophicalSampleArgument,
  theologicalSampleArgument,
  sampleToulminArgument,
];

export const sampleArgumentsES: ToulminArgument[] = [
  philosophicalSampleArgumentES,
  theologicalSampleArgumentES,
  sampleToulminArgumentES,
];
