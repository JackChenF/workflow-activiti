package com.activiti.modules.entity.dto.workflow;

import lombok.Data;

/**
 * 我发起任务列表参数
 * @author liuguofeng
 * @date 2023/11/04 14:11
 **/
@Data
public class StartListDto {
    /**
     * 用户id
     */
    private String userId;

    /**
     * 业务key
     */
    private String businessKey;

    /**
     * 流程定义名称
     */
    private String definitionName;

    /**
     * 流程定义key
     */
    private String definitionKey;
}
