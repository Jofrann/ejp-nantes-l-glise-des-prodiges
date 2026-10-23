import { useCallback, useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
export function useWorkspaceData(name, departmentId = "") {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const serial = useRef(0),
    mounted = useRef(true);
  const reload = useCallback(async () => {
    const request = ++serial.current;
    setState((s) => ({ ...s, loading: !s.data, error: "" }));
    try {
      const result = (
        await base44.functions.invoke(name, { department_id: departmentId })
      ).data;
      if (result.error || result.access_denied)
        throw Error(result.error || "Accès non autorisé");
      if (mounted.current && request === serial.current)
        setState({ data: result, loading: false, error: "" });
    } catch (e) {
      if (mounted.current && request === serial.current)
        setState({
          data: null,
          loading: false,
          error: e.message || "Chargement impossible",
        });
    }
  }, [name, departmentId]);
  useEffect(() => {
    mounted.current = true;
    reload();
    return () => {
      mounted.current = false;
      serial.current++;
    };
  }, [reload]);
  return { ...state, reload };
}
