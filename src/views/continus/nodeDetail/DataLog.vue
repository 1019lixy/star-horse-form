<script setup lang="ts" name="DataLog">
import {ref} from "vue";
import CodeJs from "@/components/comp/StarHorseEditor.js";

const
    value = ref("devops-continus:8859 2022-11-28 09:49:58 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 09:50:58 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669600258602 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 09:50:58 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 09:51:58 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669600318654 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 09:51:58 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 09:52:58 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669600378685 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 09:52:58 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 09:53:58 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669600438735 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 09:53:58 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 09:54:58 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669600498783 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 09:54:58 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 09:55:49 [RMI Scheduler(0)] DEBUG sun.rmi.dgc - RMI Scheduler(0): 72bc84c84801894f:9b8dac8:184bba42ba5:-7ffe\n" +
        "devops-continus:8859 2022-11-28 09:55:58 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669600558838 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 09:55:58 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 09:56:58 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669600618885 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 09:56:58 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 09:57:58 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669600678934 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 09:57:58 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 09:58:58 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669600738978 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 09:58:58 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 09:59:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669600799020 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 09:59:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 6 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:00:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669600859079 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:00:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:01:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669600919125 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:01:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:02:59 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669600979169 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:02:59 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:03:59 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669601039203 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:03:59 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:04:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669601099252 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:04:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:05:59 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669601159297 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:05:59 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:06:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669601219338 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:06:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:07:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669601279383 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:07:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:08:59 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669601339419 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:08:59 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:09:59 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669601399467 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:09:59 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:10:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669601459527 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:10:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:11:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669601519566 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:11:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:12:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669601579614 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:12:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:13:59 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669601639652 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:13:59 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:14:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669601699685 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:14:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:15:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669601759723 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:15:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:16:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669601819751 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:16:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:17:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669601879786 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:17:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:18:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669601939829 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:18:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:19:59 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669601999879 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:19:59 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:20:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669602059921 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:20:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:21:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669602119970 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:21:59 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:23:00 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669602180022 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:23:00 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:24:00 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669602240046 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:24:00 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:25:00 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669602300109 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:25:00 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:26:00 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669602360157 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:26:00 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:27:00 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669602420195 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:27:00 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:28:00 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669602480246 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:28:00 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:29:00 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669602540284 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:29:00 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:30:00 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669602600347 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:30:00 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:31:00 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669602660407 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:31:00 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:32:00 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669602720431 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:32:00 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:33:00 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669602780488 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:33:00 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:34:00 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669602840556 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:34:00 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:35:00 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669602900599 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:35:00 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:36:00 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669602960626 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:36:00 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:37:00 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669603020675 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:37:00 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:38:00 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669603080741 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:38:00 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:39:00 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669603140790 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:39:00 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:40:00 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669603200825 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:40:00 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:41:00 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669603260876 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:41:00 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:42:00 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669603320930 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:42:00 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:43:01 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669603381001 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:43:01 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:44:01 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669603441045 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:44:01 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:45:01 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669603501081 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:45:01 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:46:01 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669603561114 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:46:01 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:47:01 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669603621171 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:47:01 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:48:01 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669603681197 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:48:01 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:49:01 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669603741230 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:49:01 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:50:01 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669603801275 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:50:01 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:51:01 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669603861314 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:51:01 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:52:01 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669603921368 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:52:01 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:53:01 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669603981414 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:53:01 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:54:01 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669604041450 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:54:01 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:55:01 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669604101517 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:55:01 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:56:01 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669604161564 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:56:01 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:57:01 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669604221642 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:57:01 [Catalina-utility-2] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 1 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:58:01 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669604281678 sessioncount 0\n" +
        "devops-continus:8859 2022-11-28 10:58:01 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - End expire sessions StandardManager processingTime 0 expired sessions: 0\n" +
        "devops-continus:8859 2022-11-28 10:59:01 [Catalina-utility-1] DEBUG o.a.catalina.session.ManagerBase - Start expire sessions StandardManager at 1669604341718 sessioncount 0\n");

</script>

<style lang="scss" scoped>
.query-area {
  text-align: left;
  display: flex;
  font-size: 13px;
  height: calc(100% - 250px);
  flex-direction: column;
  z-index: 9999999;
  flex: 1;
}
</style>
<template>
  <div class="query-area">
    <codeJs :value="value" :lang="'jsx'" :boxHeight="'400px'"/>
  </div>
</template>

