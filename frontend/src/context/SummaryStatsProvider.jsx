import { SummaryStatsContext } from "./SummaryStatsContext";
import { useState } from "react";

const SummaryStatsProvider = ({ children }) => {
    const [summaryStats, setSummaryStats] = useState(null);

    return (
        <SummaryStatsContext.Provider value={{ summaryStats, setSummaryStats }}>
            {children}
        </SummaryStatsContext.Provider>
    );
};
export default SummaryStatsProvider;
