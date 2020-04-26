// from info provided by Dr. Paul Black
const { q } = require("@def.codes/meld-core");

exports.DADS_UPPER_ONTOLOGY = q(
  `dads:MathematicalThing a owl:Class;`,
  `dads:MathematicalThing rdfs:subClassOf owl:Class;`,
  `dads:MathematicalThing rdfs:comment "Instances of this class are Algorithms, Data Structures, Abstract Data Types, or Algorithmic Techniques.".`,
  `dads:Algorithm a owl:Class;`,
  `dads:Algorithm rdfs:subClassOf dads:MathematicalThing;`,
  `dads:Algorithm rdfs:comment "This class represents computable sets of steps to achieve desired results.";`,
  `dads:Algorithm rdfs:label "Algorithm".`,
  `dads:DataStructure a owl:Class;`,
  `dads:DataStructure rdfs:subClassOf dads:MathematicalThing;`,
  `dads:DataStructure rdfs:comment "This class represents organizations of information, usually in memory, for better algorithm efficiency, such as queue, stack, linked list, heap, dictionary, and tree, or conceptual unity, such as the name and address of a person. It may include redundant information, such as length of the list or number of nodes in a subtree.";`,
  `dads:DataStructure rdfs:label "Data Structure".`,
  `dads:AbstractDataType a owl:Class;`,
  `dads:AbstractDataType rdfs:subClassOf dads:MathematicalThing;`,
  `dads:AbstractDataType rdfs:comment "This class represents sets of data values and associated algorithm that are precisely specified independent of any particular implementation. Abstract Data Types can be components of either Algorithms or Data Structures.";`,
  `dads:AbstractDataType rdfs:label "Abstract Data Type".`,
  `dads:AlgorithmicTechnique a owl:Class;`,
  `dads:AlgorithmicTechnique rdfs:subClassOf dads:MathematicalThing;`,
  `dads:AlgorithmicTechnique rdfs:comment "This class represents general computational techniques. An Algorithmic Technique is NOT an Algorithm; rather, Algorithms use Algorithmic Techniques.";`,
  `dads:AlgorithmicTechnique rdfs:label "Algorithmic Technique". `,
  `dads:Definition a owl:Class;`,
  `dads:Definition rdfs:subClassOf owl:Class;`,
  `dads:Definition rdfs:comment "This class is at present simply a placeholder that occupies the superclass position for Definitions. Definitions are atomic elements, like vertex, or adjectives, like root or stable (sort).";`,
  `dads:Definition rdfs:label "Definition".`,
  `dads:Program a owl:Class;`,
  `dads:Program rdfs:comment "An instance of this class is a program that executes an algorithm.";`,
  `dads:Program rdfs:label "Program".`,
  `dads:computedBy a owl:ObjectProperty;`,
  `dads:computedBy rdfs:comment "This property relates an instance of Algorithmic Technique with an instance of Algorithm. It says that the Algorithmic Technique can be performed by the Algorithm.";`,
  `dads:computedBy rdfs:label "Computed By";`,
  `dads:computedBy rdfs:domain dads:AlgorithmicTechnique;`,
  `dads:computedBy rdfs:range dads:Algorithm.`,
  `dads:aggregateChild a owl:ObjectProperty;`,
  `dads:aggregateChild rdfs:comment "The property says that an Algorithm or Data Structure uses another Algorithm or Data Structure in its computation. For example, an aggregate child of Heap Sort is Heap.";`,
  `dads:aggregateChild rdfs:label "Aggregate Child";`,
  `dads:aggregateChild rdfs:domain dads:MathematicalThing;`,
  `dads:aggregateChild rdfs:range dads:MathematicalThing.`,
  `dads:complexity_Worst a owl:DatatypeProperty;`,
  `dads:complexity_Worst rdfs:comment "For now, this property relates an instance of algorithm with a string conveying its complexity in the worst case, e.g., O(n^2).";`,
  `dads:complexity_Worst rdfs:label "Worst Case Complexity";`,
  `dads:complexity_Worst rdfs:domain dads:Algorithm;`,
  `dads:complexity_Worst rdfs:range <http://www.w3.org/2001/XMLSchema#string> .`,
  `dads:complexity_Average a owl:DatatypeProperty;`,
  `dads:complexity_Average rdfs:comment "For now, this property relates an instance of algorithm with a string conveying its complexity in the typical case, e.g., O(n log n).";`,
  `dads:complexity_Average rdfs:label "Average Case Complexity";`,
  `dads:complexity_Average rdfs:domain dads:Algorithm;`,
  `dads:complexity_Average rdfs:range <http://www.w3.org/2001/XMLSchema#string> .`,
  `dads:implements a owl:ObjectProperty;`,
  `dads:implements rdfs:comment "This property relates an instances of Program with instances of Algorithm or Data Structure. It means that the Program is executable code for the Algorithm or Data Structure."; `,
  `dads:implements rdfs:label "Implements";`,
  `dads:implements rdfs:domain dads:Program;`,
  `dads:implements rdfs:range dads:MathematicalThing.`,
  `dads:implementationLanguage a owl:DatatypeProperty;`,
  `dads:implementationLanguage rdfs:comment "This property relates an instance of Program with a string indicating the programming language in which it was coded.";`,
  `dads:implementationLanguage rdfs:label "Implementation Language";`,
  `dads:implementationLanguage rdfs:domain dads:Program;`,
  `dads:implementationLanguage rdfs:range <http://www.w3.org/2001/XMLSchema#string>.`,
  `dads:implementationURL a owl:DatatypeProperty;`,
  `dads:implementationURL rdfs:comment "This property relates an instance of Program with a URL at which the program can be found.";`,
  `dads:implementationURL rdfs:label "Implementation URL";`,
  `dads:implementationURL rdfs:domain dads:Program;`,
  `dads:implementationURL rdfs:range <http://www.w3.org/2001/XMLSchema#anyURI>.`,
  `dads:ComplexityMeasure a owl:Class;`,
  `dads:ComplexityMeasure rdfs:subClassOf dads:Definition;`,
  `dads:ComplexityMeasure rdfs:comment "Complexity Measure".`,
  `dads:Omega a dads:ComplexityMeasure;`,
  `dads:Omega rdfs:comment "A theoretical measure of the execution of an algorithm, usually the time or memory needed, given the problem size $n$, which is usually the number of items. Informally, saying some equation $f(n) = \\omega (g(n))$ means $g(n)$ becomes insignificant relative to $f(n)$ as $n$ goes to infinity. ";`,
  `dads:Omega rdfs:label "Omega".`,
  `dads:Sim a dads:ComplexityMeasure;`,
  `dads:Sim rdfs:comment "(1) Proportional to. (2) Asymptotically equal to. A theoretical measure of the execution of an algorithm, usually the time or memory needed, given the problem size $n$, which is usually the number of items. Informally, saying some equation $f(n) \\sim g(n)$ means it grows at the same rate as $g(n)$. More formally, it means $lim<sub>x \\rightarrow \\infty</sub>f(x)/g(x) = 1$.";`,
  `dads:Sim rdfs:label "Sim".`,
  `dads:Theta a dads:ComplexityMeasure;`,
  `dads:Theta rdfs:comment "A theoretical measure of the execution of an algorithm, usually the time or memory needed, given the problem size $n$, which is usually the number of items. Informally, saying some equation $f(n) = \\Theta (g(n))$ means it is within a constant multiple of g(n). The equation is read, \"f of n is theta g of n\".";`,
  `dads:Theta rdfs:label "Theta".`
);