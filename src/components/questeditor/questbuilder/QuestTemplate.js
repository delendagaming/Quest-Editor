const QuestTemplate = {
  Title: "",
  Tags: "",
  Price: 0,
  Level: 1,
  Link: "",
  Location: [],
  Summary: "",
  NbParagraphs: 1,
  numDepthLevels: 1,
  paragraphRegister: [
    {
      depthNumber: 0,
      paragraphNumber: 1,

      hasLinkToNextParagraph: false,
      hasLinkToPreviousParagraph: true,
      paragraphType: "narration",
      paragraphSubTypes: {
        isSuddenDeath: false,
        isVictory: false,
        isFinalBossCombat: false
      },
      nextParagraphs: [],
      previousParagraphs: []
    }
  ],
  paragraphLinkRegister: [],
  CreationDate: "",
  LastEditDate: "",
  SubmissionDate: "",
  Status: "In Progress",
  ScribeID: "",
  ScribeName: "",
  ScribeEmail: "",
  Paragraphs: [],
  globalSaveCounter: 0
};

export default QuestTemplate;
