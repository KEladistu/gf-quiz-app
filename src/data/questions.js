export const quizSets = [
  {
    id: "set1",
    title: "Sample Quiz",
    description: "A demo quiz set — replace with your real questions!",
    questions: [
      {
        id: 1,
        question: "How would you generate a 3×4 array of random integers between 0 and 9 (inclusive)?",
        options: [
          "np.random.random((3, 4), max=9)",
          "np.random.randint(0, 10, size=(3, 4))",
          "np.random.integers(0, 9, (3, 4))",
          "np.random.int_array((3, 4), range=(0, 9))",
        ],
        correct: 1,
        explanation:
          "np.random.randint(low, high, size) generates integers in [low, high), i.e., the high bound is exclusive. To include 9, the high bound must be 10. The size parameter accepts a tuple for multidimensional arrays.",
      },
      {
        id: 2,
        question: "Which NumPy function computes the dot product of two arrays?",
        options: ["np.cross(a, b)", "np.dot(a, b)", "np.multiply(a, b)", "np.product(a, b)"],
        correct: 1,
        explanation:
          "np.dot() computes the dot product. np.multiply() does element-wise multiplication, and np.cross() computes the cross product.",
      },
      {
        id: 3,
        question: "What does the 'axis=0' parameter mean in np.sum()?",
        options: [
          "Sum all elements into a single value",
          "Sum along rows (collapse rows)",
          "Sum along columns (collapse columns)",
          "Sum only the first element",
        ],
        correct: 1,
        explanation:
          "axis=0 means summing along the first axis (rows), which collapses the rows and returns a 1D array of column sums.",
      },
    ],
  },
];