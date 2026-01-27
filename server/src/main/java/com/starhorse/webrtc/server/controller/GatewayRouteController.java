//package com.starhorse.webrtc.server.controller;
//
//import com.starhorse.devops.utils.result.Result;
//import jakarta.annotation.Resource;
//import org.springframework.cloud.gateway.handler.predicate.PredicateDefinition;
//import org.springframework.cloud.gateway.route.RouteDefinition;
//import org.springframework.cloud.gateway.route.RouteDefinitionWriter;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.RestController;
//import reactor.core.publisher.Mono;
//
//import java.net.URI;
//import java.util.ArrayList;
//import java.util.List;
//
//@RestController
//@RequestMapping("/gateway/admin")
//public class GatewayRouteController {
//
//    @Resource
//    private RouteDefinitionWriter routeDefinitionWriter;
//
//    // 动态更新秒杀路由的时间规则
//    @PostMapping("/updateSeckillRoute")
//    public Result<String> updateSeckillRoute(@RequestParam Long seckillId,
//                                             @RequestParam String startTime,
//                                             @RequestParam String endTime) {
//        // 1. 删除原有秒杀路由
//        routeDefinitionWriter.delete(Mono.just("seckill-service")).subscribe();
//
//        // 2. 构建新的路由规则（动态时间）
//        RouteDefinition routeDefinition = new RouteDefinition();
//        routeDefinition.setId("seckill-service");
//
//        // 配置路由地址
//        URI uri = URI.create("lb://seckill-service");
//        routeDefinition.setUri(uri);
//
//        // 配置时间Predicate（秒杀起止时间）
//        List<PredicateDefinition> predicates = new ArrayList<>();
//        // 路径匹配
//        PredicateDefinition pathPredicate = new PredicateDefinition();
//        pathPredicate.setName("Path");
//        pathPredicate.addArg("pattern", "/seckill/api/**");
//        predicates.add(pathPredicate);
//        // 开始时间（After）
//        PredicateDefinition afterPredicate = new PredicateDefinition();
//        afterPredicate.setName("After");
//        afterPredicate.addArg("datetime", startTime); // 格式：2026-01-30T10:00:00+08:00[Asia/Shanghai]
//        predicates.add(afterPredicate);
//        // 结束时间（Before）
//        PredicateDefinition beforePredicate = new PredicateDefinition();
//        beforePredicate.setName("Before");
//        beforePredicate.addArg("datetime", endTime);
//        predicates.add(beforePredicate);
//
//        routeDefinition.setPredicates(predicates);
//
//        // 3. 新增路由
//        routeDefinitionWriter.save(Mono.just(routeDefinition)).subscribe();
//
//        return Result.ok("秒杀路由更新成功");
//    }
//}